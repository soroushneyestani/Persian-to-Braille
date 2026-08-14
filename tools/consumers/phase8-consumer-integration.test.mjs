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
} from "../../packages/sdk/dist/index.js";

import {
  createPlaygroundController,
  projectTranslationResult,
} from "../../apps/web/dist/index.js";

const here =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const repoRoot =
  resolve(
    here,
    "../..",
  );

const cliPath =
  resolve(
    repoRoot,
    "apps/cli/dist/cli.js",
  );

const translator =
  createPersianBrailleTranslator();

function runCliTranslateJson(
  input,
) {
  const result =
    spawnSync(
      process.execPath,
      [
        cliPath,
        "translate",
        input,
        "--format=json",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        shell: false,
      },
    );

  assert.equal(
    result.signal,
    null,
  );
  assert.equal(
    result.stderr,
    "",
  );

  const envelope =
    JSON.parse(
      result.stdout,
    );

  assert.equal(
    envelope.schemaVersion,
    "1",
  );
  assert.equal(
    envelope.command,
    "translate",
  );

  return {
    status: result.status,
    envelope,
    stdout: result.stdout,
  };
}

function runCliProfileJson() {
  const result =
    spawnSync(
      process.execPath,
      [
        cliPath,
        "profile",
        "--format=json",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        shell: false,
      },
    );

  assert.equal(
    result.status,
    0,
  );
  assert.equal(
    result.stderr,
    "",
  );

  return JSON.parse(
    result.stdout,
  );
}

function expectedExitCode(
  result,
) {
  return result.ok
    ? 0
    : 1;
}

function projectWeb(
  input,
) {
  const sdkResult =
    translator.translate(
      input,
    );

  return {
    sdkResult,
    webResult:
      projectTranslationResult(
        sdkResult,
      ),
  };
}

function assertConsumerParity(
  input,
) {
  const {
    sdkResult,
    webResult,
  } =
    projectWeb(input);

  const cli =
    runCliTranslateJson(
      input,
    );

  assert.equal(
    cli.status,
    expectedExitCode(
      sdkResult,
    ),
  );

  assert.deepEqual(
    cli.envelope.result,
    sdkResult,
  );

  assert.equal(
    webResult.ok,
    sdkResult.ok,
  );

  if (sdkResult.ok) {
    assert.equal(
      webResult.unicodeBraille,
      sdkResult.unicodeBraille,
    );
    assert.deepEqual(
      webResult.cells,
      sdkResult.cells,
    );
    assert.equal(
      webResult.normalizedText,
      sdkResult.normalizedText,
    );
    assert.deepEqual(
      webResult.structuralTokens,
      sdkResult.structuralTokens,
    );
    assert.equal(
      webResult.errorCode,
      "",
    );
  } else {
    assert.equal(
      webResult.errorCode,
      sdkResult.code,
    );
    assert.equal(
      webResult.errorMessage,
      sdkResult.message,
    );
  }

  return {
    sdkResult,
    cli,
    webResult,
  };
}

test(
  "keeps successful Persian translation identical across SDK, CLI, and Web",
  () => {
    const {
      sdkResult,
    } =
      assertConsumerParity(
        "سلام",
      );

    assert.equal(
      sdkResult.ok,
      true,
    );
  },
);

test(
  "keeps layout-bearing multiline input in consumer parity",
  () => {
    const input =
      "سلام\nسلام";

    const {
      sdkResult,
      cli,
    } =
      assertConsumerParity(
        input,
      );

    assert.equal(
      cli.envelope.result.input,
      input,
    );
    assert.equal(
      sdkResult.input,
      input,
    );
  },
);

test(
  "keeps the current U+0622 SDK result in CLI/Web parity without freezing its future specification outcome",
  () => {
    const {
      sdkResult,
      cli,
      webResult,
    } =
      assertConsumerParity(
        "آ",
      );

    assert.deepEqual(
      cli.envelope.result,
      sdkResult,
    );

    if (sdkResult.ok) {
      assert.equal(
        webResult.unicodeBraille,
        sdkResult.unicodeBraille,
      );
    } else {
      assert.equal(
        webResult.errorCode,
        sdkResult.code,
      );
    }
  },
);

test(
  "keeps an expected unknown-character failure identical across consumers",
  () => {
    const {
      sdkResult,
      cli,
      webResult,
    } =
      assertConsumerParity(
        "😀",
      );

    assert.equal(
      sdkResult.ok,
      false,
    );
    assert.equal(
      sdkResult.code,
      "UNKNOWN_CHARACTER",
    );
    assert.equal(
      cli.status,
      1,
    );
    assert.equal(
      webResult.errorCode,
      "UNKNOWN_CHARACTER",
    );
  },
);

test(
  "keeps bundled profile metadata identical across SDK, CLI, and Web controller",
  () => {
    const cliEnvelope =
      runCliProfileJson();

    assert.deepEqual(
      cliEnvelope,
      {
        schemaVersion: "1",
        command: "profile",
        profile:
          translator.profile,
      },
    );

    let renderedProfile;

    const controller =
      createPlaygroundController(
        translator,
        {
          readInput() {
            return "";
          },
          writeInput() {},
          renderProfile(profile) {
            renderedProfile =
              profile;
          },
          renderResult() {},
          clearResult() {},
          renderCopyFeedback() {},
          focusInput() {},
        },
        {
          async writeText() {},
        },
      );

    assert.deepEqual(
      renderedProfile,
      translator.profile,
    );
    assert.deepEqual(
      controller.profile,
      translator.profile,
    );
  },
);

test(
  "keeps repeated CLI and Web projections deterministic",
  () => {
    const input =
      "سلام";

    const firstCli =
      runCliTranslateJson(
        input,
      );
    const secondCli =
      runCliTranslateJson(
        input,
      );

    assert.equal(
      firstCli.stdout,
      secondCli.stdout,
    );

    const result =
      translator.translate(
        input,
      );

    assert.deepEqual(
      projectTranslationResult(
        result,
      ),
      projectTranslationResult(
        result,
      ),
    );
  },
);

test(
  "preserves the public SDK result rather than exposing Core-only execution data",
  () => {
    const cli =
      runCliTranslateJson(
        "سلام",
      );

    const serialized =
      JSON.stringify(
        cli.envelope.result,
      );

    for (
      const forbidden of [
        "runtimeRule",
        "ruleSelector",
        "executionTrace",
        "modeExecutor",
        "canonicalRuleRecord",
      ]
    ) {
      assert.equal(
        serialized.includes(
          forbidden,
        ),
        false,
      );
    }
  },
);

test(
  "uses translation-result success/failure to derive CLI process status only",
  () => {
    for (
      const input of [
        "سلام",
        "آ",
        "😀",
      ]
    ) {
      const sdkResult =
        translator.translate(
          input,
        );
      const cli =
        runCliTranslateJson(
          input,
        );

      assert.equal(
        cli.status,
        expectedExitCode(
          sdkResult,
        ),
      );
      assert.equal(
        cli.envelope.result.ok,
        sdkResult.ok,
      );
    }
  },
);
