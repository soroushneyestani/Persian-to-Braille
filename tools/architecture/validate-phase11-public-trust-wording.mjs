import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const installer = await readFile(
  path.join(
    root,
    "integrations/microsoft365/public/install/windows/"
      + "Persian-to-Braille-Windows-Preview-Installer.cmd",
  ),
  "utf8",
);

const installPage = await readFile(
  path.join(
    root,
    "integrations/microsoft365/public/install.html",
  ),
  "utf8",
);

assert.doesNotMatch(
  installer,
  /signed-source/i,
  "installer must not imply that the helper is code-signed",
);

assert.match(
  installer,
  /Downloading the project setup helper over HTTPS\.\.\./,
);

assert.doesNotMatch(
  installPage,
  /Manifest رسمی/,
  "public guide must not imply Microsoft-official endorsement",
);

assert.match(
  installPage,
  /Manifest نسخه production پروژه/,
);

for (const content of [installer, installPage]) {
  assert.match(
    content,
    /not Microsoft Marketplace publication|NOT a Microsoft Marketplace installer/i,
  );
}

console.log("Phase 11 public trust wording: PASS");
console.log("Unsigned helper claim: NONE");
console.log("Microsoft-official manifest implication: NONE");
console.log("Marketplace publication claim: NONE");
console.log("Classification: PROJECT WINDOWS PREVIEW / PASS");
