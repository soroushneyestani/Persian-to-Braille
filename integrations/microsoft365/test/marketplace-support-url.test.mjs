import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createMarketplaceComplianceUrls,
  createMarketplaceSubmissionManifest,
  DEVELOPMENT_SUPPORT_URL,
} from "../marketplace/production-manifest.mjs";

const productionBaseUrl =
  "https://soroushneyestani.github.io/Braille-Hub";

test(
  "Marketplace compliance URLs are derived from the normalized production base",
  () => {
    assert.deepEqual(
      createMarketplaceComplianceUrls(
        "https://example.com/project/",
      ),
      {
        support:
          "https://example.com/project/support.html",
        privacy:
          "https://example.com/project/privacy.html",
        eula:
          "https://example.com/project/eula.html",
      },
    );
  },
);

test(
  "Marketplace submission manifest rewrites SupportUrl without changing the development manifest",
  () => {
    const developmentManifest = [
      '<IconUrl DefaultValue="https://localhost:3000/assets/icon-32.png"/>',
      `<SupportUrl DefaultValue="${DEVELOPMENT_SUPPORT_URL}"/>`,
      '<SourceLocation DefaultValue="https://localhost:3000/taskpane.html"/>',
    ].join("\n");

    const result =
      createMarketplaceSubmissionManifest(
        developmentManifest,
        "https://example.com/project/",
      );

    assert.equal(
      result.baseUrl,
      "https://example.com/project",
    );

    assert.equal(
      result.complianceUrls.support,
      "https://example.com/project/support.html",
    );

    assert.ok(
      result.manifest.includes(
        '<SupportUrl DefaultValue="https://example.com/project/support.html"/>',
      ),
    );

    assert.ok(
      !result.manifest.includes(
        'SupportUrl DefaultValue="https://github.com/soroushneyestani/Braille-Hub"',
      ),
    );

    assert.ok(
      developmentManifest.includes(
        'SupportUrl DefaultValue="https://github.com/soroushneyestani/Braille-Hub"',
      ),
    );
  },
);

test(
  "Marketplace submission manifest exposes Privacy and EULA URLs for Partner Center metadata",
  () => {
    const developmentManifest = [
      '<SourceLocation DefaultValue="https://localhost:3000/taskpane.html"/>',
      `<SupportUrl DefaultValue="${DEVELOPMENT_SUPPORT_URL}"/>`,
    ].join("\n");

    const result =
      createMarketplaceSubmissionManifest(
        developmentManifest,
        productionBaseUrl,
      );

    assert.deepEqual(
      result.complianceUrls,
      {
        support:
          `${productionBaseUrl}/support.html`,
        privacy:
          `${productionBaseUrl}/privacy.html`,
        eula:
          `${productionBaseUrl}/eula.html`,
      },
    );
  },
);

test(
  "Marketplace submission manifest rejects an unexpected development SupportUrl contract",
  () => {
    const developmentManifest = [
      '<SourceLocation DefaultValue="https://localhost:3000/taskpane.html"/>',
      '<SupportUrl DefaultValue="https://example.com/support"/>',
    ].join("\n");

    assert.throws(
      () =>
        createMarketplaceSubmissionManifest(
          developmentManifest,
          productionBaseUrl,
        ),
      /frozen development SupportUrl/,
    );
  },
);

test(
  "repository development manifest remains localhost plus repository SupportUrl",
  async () => {
    const developmentManifest =
      await readFile(
        new URL("../manifest.xml", import.meta.url),
        "utf8",
      );

    assert.ok(
      developmentManifest.includes(
        "https://localhost:3000/taskpane.html",
      ),
    );

    assert.ok(
      developmentManifest.includes(
        'SupportUrl DefaultValue="https://github.com/soroushneyestani/Braille-Hub"',
      ),
    );

    const result =
      createMarketplaceSubmissionManifest(
        developmentManifest,
        productionBaseUrl,
      );

    assert.ok(
      result.manifest.includes(
        '<SupportUrl DefaultValue="https://soroushneyestani.github.io/Braille-Hub/support.html"/>',
      ),
    );

    assert.ok(
      !result.manifest.includes(
        "https://localhost:3000",
      ),
    );
  },
);
