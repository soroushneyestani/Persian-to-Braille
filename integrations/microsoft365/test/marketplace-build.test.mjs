import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import test from "node:test";

import {
  createProductionManifest,
  normalizeProductionBaseUrl,
} from "../marketplace/production-manifest.mjs";

const developmentManifest =
  await readFile(
    new URL(
      "../manifest.xml",
      import.meta.url,
    ),
    "utf8",
  );

test(
  "production base URL accepts an HTTPS origin",
  () => {
    assert.equal(
      normalizeProductionBaseUrl(
        "https://example.com",
      ),
      "https://example.com",
    );
  },
);

test(
  "production base URL preserves a project path and removes trailing slash",
  () => {
    assert.equal(
      normalizeProductionBaseUrl(
        "https://example.com/persian-to-braille/",
      ),
      "https://example.com/persian-to-braille",
    );
  },
);

for (
  const invalid of [
    "",
    "http://example.com",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
    "https://example.com/app?mode=prod",
    "https://example.com/app#fragment",
  ]
) {
  test(
    `production base URL rejects ${JSON.stringify(invalid)}`,
    () => {
      assert.throws(
        () =>
          normalizeProductionBaseUrl(
            invalid,
          ),
      );
    },
  );
}

test(
  "production manifest rewrites only the frozen localhost deployment base",
  () => {
    const result =
      createProductionManifest(
        developmentManifest,
        "https://example.com/persian-to-braille",
      );

    assert.equal(
      result.baseUrl,
      "https://example.com/persian-to-braille",
    );

    assert.doesNotMatch(
      result.manifest,
      /https:\/\/localhost:3000/,
    );

    assert.match(
      result.manifest,
      /https:\/\/example\.com\/persian-to-braille\/taskpane\.html/,
    );

    assert.match(
      result.manifest,
      /https:\/\/example\.com\/persian-to-braille\/commands\.html/,
    );

    assert.match(
      result.manifest,
      /https:\/\/example\.com\/persian-to-braille\/assets\/icon-80\.png/,
    );

    assert.match(
      result.manifest,
      /33ec7928-1204-5bb3-88e6-d778413e9234/,
    );

    assert.match(
      result.manifest,
      /<Host Name="Document"\/>/,
    );

    assert.match(
      result.manifest,
      /<Host Name="Workbook"\/>/,
    );

    assert.match(
      result.manifest,
      /<Host Name="Presentation"\/>/,
    );
  },
);

test(
  "11.2a intentionally leaves SupportUrl for Phase 11.3",
  () => {
    const result =
      createProductionManifest(
        developmentManifest,
        "https://example.com/persian-to-braille",
      );

    assert.match(
      result.manifest,
      /<SupportUrl DefaultValue="https:\/\/github\.com\/soroushneyestani\/Persian-to-Braille"\/>/,
    );
  },
);
