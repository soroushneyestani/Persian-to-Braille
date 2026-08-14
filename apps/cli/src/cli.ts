#!/usr/bin/env node

import {
  runCli,
} from "./app.js";

interface RuntimeStdin {
  setEncoding(
    encoding: "utf8",
  ): void;
  on(
    event: "data",
    listener: (
      chunk: string,
    ) => void,
  ): void;
  on(
    event: "end",
    listener: () => void,
  ): void;
  on(
    event: "error",
    listener: (
      error: unknown,
    ) => void,
  ): void;
}

interface RuntimeWritable {
  write(
    text: string,
  ): unknown;
}

interface RuntimeProcess {
  readonly argv:
    readonly string[];
  readonly stdin:
    RuntimeStdin;
  readonly stdout:
    RuntimeWritable;
  readonly stderr:
    RuntimeWritable;
  exitCode:
    number | undefined;
}

const runtimeProcess =
  (
    globalThis as
      typeof globalThis & {
        readonly process:
          RuntimeProcess;
      }
  ).process;

function readStdin():
  Promise<string> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      let input = "";

      runtimeProcess.stdin
        .setEncoding(
          "utf8",
        );

      runtimeProcess.stdin.on(
        "data",
        (chunk) => {
          input += chunk;
        },
      );

      runtimeProcess.stdin.on(
        "end",
        () => {
          resolve(input);
        },
      );

      runtimeProcess.stdin.on(
        "error",
        (error) => {
          reject(error);
        },
      );
    },
  );
}

runtimeProcess.exitCode =
  await runCli(
    runtimeProcess.argv.slice(
      2,
    ),
    {
      readStdin,
      writeStdout(text) {
        runtimeProcess.stdout
          .write(text);
      },
      writeStderr(text) {
        runtimeProcess.stderr
          .write(text);
      },
    },
  );
