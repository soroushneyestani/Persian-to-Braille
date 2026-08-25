import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createWordMusicXmlTaskPane,
} from "../dist/taskpane/musicxml-pane.js";

class FakeElement {
  hidden = false;
  disabled = false;
  textContent = "";
  value = "";
  files = null;
  listeners = new Map();

  addEventListener(
    type,
    listener,
  ) {
    this.listeners.set(
      type,
      listener,
    );
  }
}

function fakeDocument() {
  const ids = [
    "musicxml-braille-section",
    "musicxml-file",
    "musicxml-filename",
    "musicxml-preview",
    "musicxml-insert-word",
    "musicxml-clear",
    "musicxml-translation-result",
    "musicxml-unicode-output",
    "musicxml-brf-output",
    "musicxml-diagnostic-output",
    "musicxml-translation-error",
    "musicxml-error-code",
    "musicxml-error-message",
    "musicxml-taskpane-status",
  ];

  const elements =
    new Map(
      ids.map(
        (id) => [
          id,
          new FakeElement(),
        ],
      ),
    );

  return {
    document: {
      getElementById(id) {
        return elements.get(
          id,
        )
        ?? null;
      },
    },
    elements,
  };
}

function filePort(
  name,
  bytes = new Uint8Array([
    60,
    63,
    120,
    109,
    108,
    62,
  ]),
) {
  return {
    name,
    size:
      bytes.byteLength,

    async arrayBuffer() {
      return bytes
        .slice()
        .buffer;
    },
  };
}

function success(
  sourceKind,
  unicodeBraille = "⠉",
) {
  return Object.freeze({
    ok: true,
    inputByteLength: 6,
    sourceKind,
    profile: {},
    parts: Object.freeze([]),
    brf: "C",
    unicodeBraille,
    diagnostics:
      Object.freeze([]),
  });
}

function translator(
  calls,
) {
  return {
    profile: {},

    translateMusicXml(
      bytes,
    ) {
      calls.push([
        "musicxml",
        bytes.byteLength,
      ]);

      return success(
        "musicxml",
      );
    },

    translateMusicXmlOrThrow() {
      throw new Error(
        "not used",
      );
    },

    async translateMxl(
      bytes,
    ) {
      calls.push([
        "mxl",
        bytes.byteLength,
      ]);

      return success(
        "mxl",
        "⠍",
      );
    },

    async translateMxlOrThrow() {
      throw new Error(
        "not used",
      );
    },
  };
}

test(
  "MusicXML controls are Word-only and independent from the MIDI pane",
  () => {
    const {
      document,
      elements,
    } =
      fakeDocument();

    const calls = [];

    const controller =
      createWordMusicXmlTaskPane(
        document,
        translator(
          calls,
        ),
      );

    controller.setHost(
      "excel",
    );

    assert.equal(
      elements.get(
        "musicxml-braille-section",
      ).hidden,
      true,
    );

    controller.setHost(
      "word",
    );

    assert.equal(
      elements.get(
        "musicxml-braille-section",
      ).hidden,
      false,
    );

    assert.deepEqual(
      calls,
      [],
    );
  },
);

test(
  "MusicXML tab rejects MIDI extensions before calling the MusicXML SDK",
  async () => {
    const {
      document,
      elements,
    } =
      fakeDocument();

    const calls = [];

    const controller =
      createWordMusicXmlTaskPane(
        document,
        translator(
          calls,
        ),
      );

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "score.mid",
      ),
    );

    assert.deepEqual(
      calls,
      [],
    );

    assert.equal(
      elements.get(
        "musicxml-error-code",
      ).textContent,
      "UNSUPPORTED_MUSICXML_FILE_EXTENSION",
    );
  },
);

for (
  const extension
  of [
    "musicxml",
    "xml",
  ]
) {
  test(
    `.${extension} uses the dedicated MusicXML SDK route and renders exact preview`,
    async () => {
      const {
        document,
        elements,
      } =
        fakeDocument();

      const calls = [];

      const controller =
        createWordMusicXmlTaskPane(
          document,
          translator(
            calls,
          ),
        );

      controller.setHost(
        "word",
      );

      await controller.selectFile(
        filePort(
          `score.${extension}`,
        ),
      );

      await controller
        .previewSelectedScore();

      assert.deepEqual(
        calls,
        [
          [
            "musicxml",
            6,
          ],
        ],
      );

      assert.equal(
        elements.get(
          "musicxml-unicode-output",
        ).textContent,
        "⠉",
      );

      assert.equal(
        elements.get(
          "musicxml-brf-output",
        ).textContent,
        "C",
      );

      assert.equal(
        elements.get(
          "musicxml-translation-result",
        ).hidden,
        false,
      );
    },
  );
}

test(
  ".mxl uses the dedicated asynchronous MXL SDK route",
  async () => {
    const {
      document,
      elements,
    } =
      fakeDocument();

    const calls = [];

    const controller =
      createWordMusicXmlTaskPane(
        document,
        translator(
          calls,
        ),
      );

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "score.mxl",
      ),
    );

    await controller
      .previewSelectedScore();

    assert.deepEqual(
      calls,
      [
        [
          "mxl",
          6,
        ],
      ],
    );

    assert.equal(
      elements.get(
        "musicxml-unicode-output",
      ).textContent,
      "⠍",
    );
  },
);

test(
  "MusicXML SDK failures stay SDK-domain failures in the independent pane",
  async () => {
    const {
      document,
      elements,
    } =
      fakeDocument();

    const controller =
      createWordMusicXmlTaskPane(
        document,
        {
          profile: {},

          translateMusicXml() {
            return Object.freeze({
              ok: false,
              inputByteLength: 6,
              sourceKind: "musicxml",
              profile: {},
              code:
                "UNSUPPORTED_SLUR",
              stage:
                "bridge",
              message:
                "Unsupported slur topology.",
            });
          },

          translateMusicXmlOrThrow() {
            throw new Error(
              "not used",
            );
          },

          async translateMxl() {
            throw new Error(
              "not used",
            );
          },

          async translateMxlOrThrow() {
            throw new Error(
              "not used",
            );
          },
        },
      );

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "score.musicxml",
      ),
    );

    await controller
      .previewSelectedScore();

    assert.equal(
      elements.get(
        "musicxml-error-code",
      ).textContent,
      "UNSUPPORTED_SLUR",
    );

    assert.match(
      elements.get(
        "musicxml-error-message",
      ).textContent,
      /^bridge:/,
    );
  },
);

test(
  "MusicXML insertion writes the exact successful preview without retranslating",
  async () => {
    const {
      document,
    } =
      fakeDocument();

    const calls = [];
    const inserted = [];

    const controller =
      createWordMusicXmlTaskPane(
        document,
        translator(
          calls,
        ),
      );

    controller.setInsertionService({
      async insertCurrentSelection(
        text,
      ) {
        inserted.push(
          text,
        );

        return Object.freeze({
          ok: true,
        });
      },
    });

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "score.musicxml",
      ),
    );

    await controller
      .previewSelectedScore();

    await controller
      .insertPreviewIntoWord();

    assert.deepEqual(
      calls,
      [
        [
          "musicxml",
          6,
        ],
      ],
    );

    assert.deepEqual(
      inserted,
      [
        "⠉",
      ],
    );
  },
);

test(
  "built task pane exposes separate Music MIDI and MusicXML tabs and file pickers",
  async () => {
    const html =
      await readFile(
        new URL(
          "../addin-dist/taskpane.html",
          import.meta.url,
        ),
        "utf8",
      );

    for (
      const token
      of [
        'id="feature-tab-music"',
        "Music / MIDI",
        'id="feature-tab-musicxml"',
        'id="music-midi-file"',
        'accept=".mid,.midi"',
        'id="musicxml-file"',
        'accept=".musicxml,.xml,.mxl"',
        'id="music-braille-section"',
        'id="musicxml-braille-section"',
      ]
    ) {
      assert.equal(
        html.includes(
          token,
        ),
        true,
        `missing separate-tab token: ${token}`,
      );
    }

    assert.match(
      html,
      />\s*MusicXML\s*</,
      "MusicXML tab label is missing or not rendered as visible button text.",
    );
  },
);
