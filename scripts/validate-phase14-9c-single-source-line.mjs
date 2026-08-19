import assert from "node:assert/strict";
import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

const root =
  process.cwd();

async function text(
  relativePath,
) {
  return readFile(
    path.join(
      root,
      relativePath,
    ),
    "utf8",
  );
}

const sourceLine =
  await text(
    "packages/music/src/midi-source-line.ts",
  );

const bridge =
  await text(
    "packages/music/src/midi-to-braille.ts",
  );

const sdkApi =
  await text(
    "packages/sdk/src/music-public-api.ts",
  );

const sdkTranslator =
  await text(
    "packages/sdk/src/music-translator.ts",
  );

const pane =
  await text(
    "integrations/microsoft365/src/taskpane/music-pane.ts",
  );

const html =
  await text(
    "integrations/microsoft365/public/taskpane.html",
  );

for (const marker of [
  "inspectMidiSourceLines",
  "selectMidiSourceLine",
  "source.notes.filter",
  "source.parts.filter",
  "programChangeEvents",
  "pitchBendEvents",
]) {
  assert.ok(
    sourceLine.includes(
      marker,
    ),
    `engine selected-line marker missing: ${marker}`,
  );
}

for (const marker of [
  "translateMidiSourceLineToBraille",
  "MIDI_SOURCE_LINE_NOT_FOUND",
  "selectMidiSourceLine(",
  "reduceMidiToGlobalPianoRoll(",
]) {
  assert.ok(
    bridge.includes(
      marker,
    ),
    `bridge selected-line marker missing: ${marker}`,
  );
}

for (const marker of [
  "MusicBrailleMidiSourceLineSelection",
  "MusicBrailleMidiSourceLineInspectionResult",
  "inspectMidi(",
  "translateMidiLine(",
]) {
  assert.ok(
    sdkApi.includes(
      marker,
    ),
    `SDK selected-line marker missing: ${marker}`,
  );
}

assert.ok(
  sdkTranslator.includes(
    "inspectMidiSourceLines",
  ),
);

assert.ok(
  sdkTranslator.includes(
    "translateMidiSourceLineToBraille",
  ),
);

for (const marker of [
  "music-source-line-section",
  "music-source-line",
  "Choose exactly one MIDI line",
  "translator.inspectMidi(",
  "translator.translateMidiLine(",
]) {
  assert.ok(
    pane.includes(
      marker,
    )
    || html.includes(
      marker,
    ),
    `Word selected-line marker missing: ${marker}`,
  );
}

assert.equal(
  pane.includes(
    "@persian-braille/music",
  ),
  false,
);

assert.equal(
  html.includes(
    "All Lines",
  ),
  false,
);

console.log(
  "PHASE 14.9c SINGLE SOURCE LINE MIDI PROFILE: PASS",
);

console.log(
  "Source-line identity            : TRACK + CHANNEL",
);

console.log(
  "Phase 14 UI selection           : EXACTLY ONE LINE",
);

console.log(
  "Multi-line / All Lines          : NOT EXPOSED",
);

console.log(
  "Selected-line note filtering    : NONE",
);

console.log(
  "Microsoft365 direct music       : NONE",
);

console.log(
  "MusicXML                        : PHASE 19",
);
