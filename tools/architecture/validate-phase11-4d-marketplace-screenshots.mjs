import {
  createHash,
} from "node:crypto";
import {
  readFile,
} from "node:fs/promises";

const root =
  new URL("../../", import.meta.url);

const manifestUrl =
  new URL(
    "integrations/microsoft365/marketplace/listing/assets/screenshots/manifest.json",
    root,
  );

function fail(message) {
  throw new Error(
    `Phase 11.4d screenshot validation failed: ${message}`,
  );
}

function sha256(buffer) {
  return createHash("sha256")
    .update(buffer)
    .digest("hex");
}

function pngDimensions(buffer) {
  const signature =
    Buffer.from([
      0x89, 0x50, 0x4e, 0x47,
      0x0d, 0x0a, 0x1a, 0x0a,
    ]);

  if (
    buffer.length < 24
    || !buffer.subarray(0, 8).equals(signature)
    || buffer.toString("ascii", 12, 16) !== "IHDR"
  ) {
    fail("invalid PNG screenshot");
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const manifest =
  JSON.parse(
    await readFile(
      manifestUrl,
      "utf8",
    ),
  );

if (
  manifest.schemaVersion !== 1
  || manifest.phase !== "11.4d"
  || manifest.status !== "captured-and-validated"
  || manifest.locale !== "en-US"
  || manifest.listingName !== "Braille Hub"
) {
  fail("manifest identity mismatch");
}

const expected = [
  {
    host: "Word",
    filename: "word-selection.png",
    insertAfter: true,
  },
  {
    host: "Excel",
    filename: "excel-text-cell.png",
    insertAfter: false,
  },
  {
    host: "PowerPoint",
    filename: "powerpoint-text-range.png",
    insertAfter: false,
  },
];

if (
  !Array.isArray(manifest.screenshots)
  || manifest.screenshots.length !== 3
) {
  fail("exactly three screenshot assets are required");
}

for (const item of expected) {
  const asset =
    manifest.screenshots.find(
      (entry) =>
        entry.host === item.host,
    );

  if (!asset) {
    fail(`missing ${item.host} screenshot record`);
  }

  if (
    asset.filename !== item.filename
    || asset.status !== "captured"
    || asset.capturePlatform
      !== "Microsoft 365 Desktop on Windows"
    || asset.format !== "image/png"
  ) {
    fail(`${item.host} screenshot metadata mismatch`);
  }

  const assetUrl =
    new URL(
      asset.path,
      root,
    );

  const buffer =
    await readFile(assetUrl);

  const dimensions =
    pngDimensions(buffer);

  if (
    dimensions.width !== asset.width
    || dimensions.height !== asset.height
    || buffer.length !== asset.byteSize
    || sha256(buffer) !== asset.sha256
  ) {
    fail(`${item.host} screenshot hash/dimension mismatch`);
  }

  if (
    dimensions.width <= dimensions.height
    || dimensions.width < 1200
    || dimensions.height < 700
  ) {
    fail(`${item.host} screenshot readability gate failed`);
  }

  const capabilities =
    asset.capabilitiesShown;

  for (const required of [
    "Translate Selection",
    "Braille Preview",
    "Copy Braille",
    "Replace Selection",
  ]) {
    if (!capabilities.includes(required)) {
      fail(`${item.host} is missing ${required} capability evidence`);
    }
  }

  if (
    capabilities.includes("Insert After")
    !== item.insertAfter
  ) {
    fail(`${item.host} Insert After capability mismatch`);
  }

  if (
    asset.privacyReview?.privateDocumentContent !== false
    || asset.privacyReview?.privateFilePath !== false
    || asset.privacyReview?.privateEmailAddress !== false
  ) {
    fail(`${item.host} privacy-review boundary mismatch`);
  }
}

if (
  manifest.assetPolicy?.exactPartnerCenterDimensionRequirementObserved
    !== false
  || manifest.assetPolicy?.noWebOrMacLiveVerificationClaim
    !== true
  || manifest.assetPolicy?.noMarketplacePublicationClaim
    !== true
) {
  fail("listing/certification boundary mismatch");
}

if (
  manifest.summary?.capturedCount !== 3
  || manifest.summary?.windowsDesktopCaptured !== true
  || manifest.summary?.webLiveVerified !== false
  || manifest.summary?.macLiveVerified !== false
  || manifest.summary?.publisherGate
    !== "external-blocked-preserved"
) {
  fail("screenshot summary mismatch");
}

const note =
  await readFile(
    new URL(
      "docs/architecture/phase-11.4d-marketplace-screenshots.md",
      root,
    ),
    "utf8",
  );

for (const required of [
  "CLOSED — WINDOWS DESKTOP SCREENSHOTS CAPTURED AND VALIDATED",
  "word-selection.png",
  "excel-text-cell.png",
  "powerpoint-text-range.png",
  "Windows Desktop capture evidence only",
  "Windows Desktop Preview Installer + Persian installation guide",
]) {
  if (!note.includes(required)) {
    fail(`closure note missing ${JSON.stringify(required)}`);
  }
}

console.log(
  "Phase 11.4d Marketplace screenshots / listing assets: PASS",
);
console.log(
  "Word: CAPTURED / PASS",
);
console.log(
  "Excel: CAPTURED / PASS",
);
console.log(
  "PowerPoint: CAPTURED / PASS",
);
console.log(
  "Windows Desktop: CAPTURE EVIDENCE / PASS",
);
console.log(
  "Web / Mac: EXPECTED / NOT EXECUTED",
);
console.log(
  "Marketplace publication claim: NONE",
);
console.log(
  "Publisher gate: EXTERNAL BLOCKED / PRESERVED",
);
console.log(
  "Next: Phase 11.4e Windows Desktop Preview Installer + Persian installation guide",
);
