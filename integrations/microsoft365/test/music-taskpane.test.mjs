import assert from "node:assert/strict";
import test from "node:test";

import {
  createWordMusicTaskPane,
} from "../dist/taskpane/music-pane.js";

class FakeElement {
  hidden = false;
  disabled = false;
  textContent = "";
  value = "";
  innerHTML = "";
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
    "music-braille-section",
    "music-midi-file",
    "music-midi-filename",
    "music-source-line-section",
    "music-source-line",
    "music-preview-midi",
    "music-insert-word",
    "music-clear",
    "music-translation-result",
    "music-unicode-output",
    "music-brf-output",
    "music-diagnostic-output",
    "music-translation-error",
    "music-error-code",
    "music-error-message",
    "music-taskpane-status",
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

function be16(value) {
  return [
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

function be32(value) {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ];
}

function ascii(value) {
  return Array.from(
    value,
    (character) =>
      character.charCodeAt(0),
  );
}

function vlq(value) {
  const bytes = [
    value & 0x7f,
  ];

  let remaining =
    value >>> 7;

  while (remaining > 0) {
    bytes.unshift(
      (remaining & 0x7f) | 0x80,
    );
    remaining >>>= 7;
  }

  return bytes;
}

function track(events) {
  const payload =
    events.flat();

  return [
    ...ascii("MTrk"),
    ...be32(
      payload.length,
    ),
    ...payload,
  ];
}

function midiFile(events) {
  const trackBytes =
    track(
      events,
    );

  return new Uint8Array([
    ...ascii("MThd"),
    ...be32(6),
    ...be16(0),
    ...be16(1),
    ...be16(96),
    ...trackBytes,
  ]);
}

const endOfTrack = [
  0x00,
  0xff,
  0x2f,
  0x00,
];

function canonicalMidi() {
  return midiFile([
    [0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08],
    [0x00, 0xff, 0x59, 0x02, 0x00, 0x00],
    [0x00, 0x90, 60, 100],
    [...vlq(96), 0x80, 60, 0],
    [0x00, 0x90, 62, 100],
    [...vlq(96), 0x80, 62, 0],
    [0x00, 0x90, 64, 100],
    [...vlq(192), 0x80, 64, 0],
    endOfTrack,
  ]);
}

function twoLineMidi() {
  return midiFile([
    [0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08],
    [0x00, 0xff, 0x59, 0x02, 0x00, 0x00],
    [0x00, 0x90, 60, 100],
    [0x00, 0x91, 67, 100],
    [...vlq(96), 0x80, 60, 0],
    [0x00, 0x81, 67, 0],
    endOfTrack,
  ]);
}

function filePort(
  name,
  bytes,
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

test(
  "Braille Music controls are Word-only",
  async () => {
    const {
      document,
      elements,
    } = fakeDocument();

    const controller =
      createWordMusicTaskPane(
        document,
        {
          profile: {},
          inspectMidi() {
            throw new Error(
              "not called",
            );
          },
          translateMidiLine() {
            throw new Error(
              "not called",
            );
          },
        },
      );

    controller.setHost(
      "excel",
    );

    assert.equal(
      elements.get(
        "music-braille-section",
      ).hidden,
      true,
    );

    controller.setHost(
      "word",
    );

    assert.equal(
      elements.get(
        "music-braille-section",
      ).hidden,
      false,
    );
  },
);

test(
  "one-line MIDI is auto-selected and translated through the public SDK",
  async () => {
    const {
      document,
      elements,
    } = fakeDocument();

    const controller =
      createWordMusicTaskPane(
        document,
      );

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "phrase.mid",
        canonicalMidi(),
      ),
    );

    assert.equal(
      elements.get(
        "music-source-line",
      ).value,
      "0:0",
    );

    assert.equal(
      elements.get(
        "music-preview-midi",
      ).disabled,
      false,
    );

    await controller.previewSelectedMidi();

    assert.equal(
      elements.get(
        "music-unicode-output",
      ).textContent,
      "⠼⠙⠲⠀⠐⠹⠱⠏",
    );
  },
);

test(
  "multi-line MIDI requires exactly one source-line selection before preview",
  async () => {
    const {
      document,
      elements,
    } = fakeDocument();

    const controller =
      createWordMusicTaskPane(
        document,
      );

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "two-lines.mid",
        twoLineMidi(),
      ),
    );

    assert.equal(
      elements.get(
        "music-preview-midi",
      ).disabled,
      true,
    );

    assert.match(
      elements.get(
        "music-source-line",
      ).innerHTML,
      /Line 1/,
    );

    assert.match(
      elements.get(
        "music-source-line",
      ).innerHTML,
      /Line 2/,
    );

    controller.selectSourceLine(
      "0:1",
    );

    assert.equal(
      elements.get(
        "music-preview-midi",
      ).disabled,
      false,
    );

    await controller.previewSelectedMidi();

    assert.equal(
      elements.get(
        "music-translation-result",
      ).hidden,
      false,
    );
  },
);

test(
  "unsupported file extensions fail before SDK MIDI inspection",
  async () => {
    const {
      document,
      elements,
    } = fakeDocument();

    let inspectionCalls =
      0;

    const controller =
      createWordMusicTaskPane(
        document,
        {
          profile: {},
          inspectMidi() {
            inspectionCalls +=
              1;
            throw new Error(
              "must not run",
            );
          },
          translateMidiLine() {
            throw new Error(
              "must not run",
            );
          },
        },
      );

    controller.setHost(
      "word",
    );

    await controller.selectFile({
      name:
        "score.musicxml",
      size:
        10,

      async arrayBuffer() {
        return new ArrayBuffer(
          10,
        );
      },
    });

    assert.equal(
      inspectionCalls,
      0,
    );

    assert.equal(
      elements.get(
        "music-error-code",
      ).textContent,
      "UNSUPPORTED_MIDI_FILE_EXTENSION",
    );
  },
);

test(
  "SDK inspection failures remain SDK-domain preview failures",
  async () => {
    const {
      document,
      elements,
    } = fakeDocument();

    const controller =
      createWordMusicTaskPane(
        document,
        {
          profile: {},

          inspectMidi() {
            return {
              ok: false,
              inputByteLength: 2,
              code:
                "INVALID_MIDI_FILE",
              message:
                "Invalid MIDI fixture.",
            };
          },

          translateMidiLine() {
            throw new Error(
              "not used",
            );
          },
        },
      );

    controller.setHost(
      "word",
    );

    await controller.selectFile({
      name:
        "broken.midi",
      size:
        2,

      async arrayBuffer() {
        return new ArrayBuffer(
          2,
        );
      },
    });

    assert.equal(
      elements.get(
        "music-error-code",
      ).textContent,
      "INVALID_MIDI_FILE",
    );
  },
);

test(
  "insertion writes the exact selected-line preview without retranslating MIDI",
  async () => {
    const {
      document,
      elements,
    } = fakeDocument();

    let translationCalls =
      0;

    const inserted = [];

    const controller =
      createWordMusicTaskPane(
        document,
        {
          profile: {},

          inspectMidi() {
            return {
              ok: true,
              inputByteLength: 1,
              format: 0,
              ticksPerQuarterNote: 96,
              lines: [
                {
                  id: "0:0",
                  trackIndex: 0,
                  channel: 0,
                  channelOneBased: 1,
                  noteCount: 1,
                },
              ],
            };
          },

          translateMidiLine() {
            translationCalls +=
              1;

            return {
              ok: true,
              inputByteLength: 1,
              profile: {},
              format: 0,
              ticksPerQuarterNote: 96,
              parts: [],
              brf:
                '#d4 "?:p',
              unicodeBraille:
                "⠼⠙⠲⠀⠐⠹⠱⠏",
              diagnostics: [],
            };
          },
        },
      );

    controller.setInsertionService({
      async insertCurrentSelection(
        unicodeBraille,
      ) {
        inserted.push(
          unicodeBraille,
        );

        return {
          ok: true,
          unicodeBraille,
        };
      },
    });

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "phrase.mid",
        new Uint8Array([
          0,
        ]),
      ),
    );

    await controller.previewSelectedMidi();

    await controller.insertPreviewIntoWord();

    assert.equal(
      translationCalls,
      1,
    );

    assert.deepEqual(
      inserted,
      [
        "⠼⠙⠲⠀⠐⠹⠱⠏",
      ],
    );

    assert.equal(
      elements.get(
        "music-taskpane-status",
      ).textContent,
      "Music Braille inserted into the current Word selection/caret.",
    );
  },
);

test(
  "changing source line invalidates successful preview and disables insertion",
  async () => {
    const {
      document,
      elements,
    } = fakeDocument();

    const controller =
      createWordMusicTaskPane(
        document,
      );

    controller.setInsertionService({
      async insertCurrentSelection() {
        throw new Error(
          "must not run after line change",
        );
      },
    });

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "two-lines.mid",
        twoLineMidi(),
      ),
    );

    controller.selectSourceLine(
      "0:0",
    );

    await controller.previewSelectedMidi();

    assert.equal(
      elements.get(
        "music-translation-result",
      ).hidden,
      false,
    );

    controller.selectSourceLine(
      "0:1",
    );

    assert.equal(
      elements.get(
        "music-translation-result",
      ).hidden,
      true,
    );

    assert.equal(
      elements.get(
        "music-insert-word",
      ).disabled,
      true,
    );
  },
);

test(
  "clear removes MIDI file, line selection, and preview state",
  async () => {
    const {
      document,
      elements,
    } = fakeDocument();

    const controller =
      createWordMusicTaskPane(
        document,
      );

    controller.setHost(
      "word",
    );

    await controller.selectFile(
      filePort(
        "phrase.midi",
        canonicalMidi(),
      ),
    );

    await controller.previewSelectedMidi();

    controller.clear();

    assert.equal(
      elements.get(
        "music-translation-result",
      ).hidden,
      true,
    );

    assert.equal(
      elements.get(
        "music-unicode-output",
      ).textContent,
      "",
    );

    assert.equal(
      elements.get(
        "music-midi-filename",
      ).textContent,
      "No MIDI file selected.",
    );

    assert.equal(
      elements.get(
        "music-source-line-section",
      ).hidden,
      true,
    );
  },
);
