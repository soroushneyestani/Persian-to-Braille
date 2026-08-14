import assert from "node:assert/strict";
import {
  spawnSync,
} from "node:child_process";
import {
  dirname,
  resolve,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";
import test from "node:test";

import {
  createPersianBrailleTranslator,
} from "@persian-braille/sdk";

import {
  CLI_EXIT_CODES,
  runCli,
} from "../dist/index.js";

const here =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const cliPath =
  resolve(
    here,
    "../dist/cli.js",
  );

const translator =
  createPersianBrailleTranslator();

function spawnCli(
  args,
  {
    input,
  } = {},
) {
  return spawnSync(
    process.execPath,
    [
      cliPath,
      ...args,
    ],
    {
      input,
      encoding: "utf8",
      shell: false,
    },
  );
}

test(
  "runs the compiled CLI entrypoint and shows help",
  () => {
    const result =
      spawnCli([
        "--help",
      ]);

    assert.equal(
      result.status,
      CLI_EXIT_CODES.success,
    );
    assert.equal(
      result.stderr,
      "",
    );
    assert.match(
      result.stdout,
      /persian-braille translate/,
    );
    assert.match(
      result.stdout,
      /persian-braille profile/,
    );
  },
);

test(
  "translates one positional argument to Unicode Braille by default",
  () => {
    const expected =
      translator.translate(
        "سلام",
      );

    assert.equal(
      expected.ok,
      true,
    );

    const result =
      spawnCli([
        "translate",
        "سلام",
      ]);

    assert.equal(
      result.status,
      0,
    );
    assert.equal(
      result.stderr,
      "",
    );
    assert.equal(
      result.stdout,
      `${expected.unicodeBraille}\n`,
    );
  },
);

test(
  "passes stdin to the SDK verbatim",
  () => {
    const input =
      "سلام";
    const expected =
      translator.translate(
        input,
      );

    assert.equal(
      expected.ok,
      true,
    );

    const result =
      spawnCli(
        [
          "translate",
          "--stdin",
        ],
        {
          input,
        },
      );

    assert.equal(
      result.status,
      0,
    );
    assert.equal(
      result.stdout,
      `${expected.unicodeBraille}\n`,
    );
  },
);

test(
  "renders the SDK cells array without recomputing it",
  () => {
    const expected =
      translator.translate(
        "سلام",
      );

    assert.equal(
      expected.ok,
      true,
    );

    const result =
      spawnCli([
        "translate",
        "سلام",
        "--format",
        "cells",
      ]);

    assert.equal(
      result.status,
      0,
    );
    assert.equal(
      result.stdout,
      `${expected.cells.join(" ")}\n`,
    );
  },
);

test(
  "serializes a versioned JSON success envelope",
  () => {
    const expected =
      translator.translate(
        "سلام",
      );

    assert.equal(
      expected.ok,
      true,
    );

    const result =
      spawnCli([
        "translate",
        "سلام",
        "--format=json",
      ]);

    assert.equal(
      result.status,
      0,
    );
    assert.equal(
      result.stderr,
      "",
    );
    assert.deepEqual(
      JSON.parse(
        result.stdout,
      ),
      {
        schemaVersion: "1",
        command: "translate",
        result: expected,
      },
    );
  },
);

test(
  "keeps expected SDK failures machine-readable in JSON mode",
  () => {
    const expected =
      translator.translate(
        "😀",
      );

    assert.equal(
      expected.ok,
      false,
    );
    assert.equal(
      expected.code,
      "UNKNOWN_CHARACTER",
    );

    const result =
      spawnCli([
        "translate",
        "😀",
        "--format",
        "json",
      ]);

    assert.equal(
      result.status,
      CLI_EXIT_CODES
        .translationFailure,
    );
    assert.equal(
      result.stderr,
      "",
    );
    assert.deepEqual(
      JSON.parse(
        result.stdout,
      ),
      {
        schemaVersion: "1",
        command: "translate",
        result: expected,
      },
    );
  },
);

test(
  "renders human translation failures on stderr with the SDK code",
  () => {
    const result =
      spawnCli([
        "translate",
        "😀",
      ]);

    assert.equal(
      result.status,
      CLI_EXIT_CODES
        .translationFailure,
    );
    assert.equal(
      result.stdout,
      "",
    );
    assert.match(
      result.stderr,
      /^UNKNOWN_CHARACTER:/,
    );
  },
);

test(
  "prints bundled profile metadata in text mode",
  () => {
    const profile =
      translator.profile;

    const result =
      spawnCli([
        "profile",
      ]);

    assert.equal(
      result.status,
      0,
    );
    assert.equal(
      result.stderr,
      "",
    );
    assert.equal(
      result.stdout,
      [
        `Profile: ${profile.id}`,
        `Version: ${profile.version}`,
        `Status: ${profile.status}`,
        `Direction: ${profile.direction}`,
        "",
      ].join("\n"),
    );
  },
);

test(
  "serializes bundled profile metadata in JSON mode",
  () => {
    const result =
      spawnCli([
        "profile",
        "--format=json",
      ]);

    assert.equal(
      result.status,
      0,
    );
    assert.deepEqual(
      JSON.parse(
        result.stdout,
      ),
      {
        schemaVersion: "1",
        command: "profile",
        profile:
          translator.profile,
      },
    );
  },
);

test(
  "maps missing translation input to a usage error",
  () => {
    const result =
      spawnCli([
        "translate",
      ]);

    assert.equal(
      result.status,
      CLI_EXIT_CODES
        .usageError,
    );
    assert.equal(
      result.stdout,
      "",
    );
    assert.match(
      result.stderr,
      /^USAGE_ERROR:/,
    );
  },
);

test(
  "rejects simultaneous positional and stdin input",
  () => {
    const result =
      spawnCli(
        [
          "translate",
          "سلام",
          "--stdin",
        ],
        {
          input: "سلام",
        },
      );

    assert.equal(
      result.status,
      CLI_EXIT_CODES
        .usageError,
    );
    assert.match(
      result.stderr,
      /exactly one source/,
    );
  },
);

test(
  "returns deterministic JSON for repeated translation",
  () => {
    const args = [
      "translate",
      "سلام",
      "--format=json",
    ];

    const first =
      spawnCli(args);
    const second =
      spawnCli(args);

    assert.equal(
      first.status,
      0,
    );
    assert.equal(
      second.status,
      0,
    );
    assert.equal(
      first.stdout,
      second.stdout,
    );
  },
);

test(
  "maps unexpected IO failures to internalError without a stack trace",
  async () => {
    let stdout = "";
    let stderr = "";

    const exitCode =
      await runCli(
        [
          "translate",
          "--stdin",
        ],
        {
          async readStdin() {
            throw new Error(
              "synthetic failure",
            );
          },
          writeStdout(text) {
            stdout += text;
          },
          writeStderr(text) {
            stderr += text;
          },
        },
      );

    assert.equal(
      exitCode,
      CLI_EXIT_CODES
        .internalError,
    );
    assert.equal(
      stdout,
      "",
    );
    assert.equal(
      stderr,
      "INTERNAL_ERROR: Unexpected CLI failure.\n",
    );
    assert.doesNotMatch(
      stderr,
      /synthetic failure|at /,
    );
  },
);
