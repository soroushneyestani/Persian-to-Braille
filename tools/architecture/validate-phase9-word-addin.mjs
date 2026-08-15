import {
  readFile,
} from "node:fs/promises";

const manifest =
  await readFile(
    new URL(
      "../../integrations/microsoft365/manifest.xml",
      import.meta.url,
    ),
    "utf8",
  );

const taskpane =
  await readFile(
    new URL(
      "../../integrations/microsoft365/public/taskpane.html",
      import.meta.url,
    ),
    "utf8",
  );

function requireText(
  value,
  text,
  label,
) {
  if (!value.includes(text)) {
    throw new Error(
      `Phase 9 Word Add-in validation failed: ${label}`,
    );
  }
}

function forbidText(
  value,
  text,
  label,
) {
  if (value.includes(text)) {
    throw new Error(
      `Phase 9 Word Add-in validation failed: ${label}`,
    );
  }
}

requireText(
  manifest,
  '<Host Name="Document"/>',
  "base manifest must target Word Document host",
);

requireText(
  manifest,
  '<Host xsi:type="Document">',
  "Word command override must remain present",
);

requireText(
  manifest,
  '<bt:Set Name="AddinCommands" MinVersion="1.1"/>',
  "Word command override must remain gated by AddinCommands 1.1",
);

requireText(
  manifest,
  'xsi:type="ShowTaskpane"',
  "ribbon command must open a task pane",
);

requireText(
  manifest,
  '<OfficeTab id="TabHome">',
  "ribbon command must be on the Home tab",
);

requireText(
  manifest,
  'DefaultValue="https://localhost:3000/taskpane.html"',
  "task pane must use HTTPS localhost during Phase 9",
);

requireText(
  manifest,
  '<Permissions>ReadWriteDocument</Permissions>',
  "Word mutation workflow requires ReadWriteDocument",
);

requireText(
  taskpane,
  "https://appsforoffice.microsoft.com/lib/1/hosted/office.js",
  "task pane must load Office.js from the Microsoft CDN",
);

requireText(
  taskpane,
  '"@persian-braille/sdk": "./vendor/sdk/index.js"',
  "task pane import map must resolve the public SDK",
);

requireText(
  taskpane,
  '"@persian-braille/core": "./vendor/core/index.js"',
  "browser runtime must materialize the SDK transitive Core dependency",
);

requireText(
  taskpane,
  'id="translate-selection"',
  "task pane must provide Translate Selection",
);

requireText(
  taskpane,
  'id="replace-selection"',
  "task pane must provide Replace Selection",
);

requireText(
  taskpane,
  'id="insert-after-selection"',
  "task pane must provide Insert After",
);

forbidText(
  taskpane,
  "localStorage",
  "task pane must not introduce localStorage input persistence",
);

forbidText(
  taskpane,
  "sessionStorage",
  "task pane must not introduce sessionStorage input persistence",
);

console.log(
  "Phase 9 Word Add-in static contract validation: PASS",
);
console.log(
  "Host compatibility slice: Word",
);
console.log(
  "Ribbon: Home -> Persian-to-Braille -> Translate Selection",
);
console.log(
  "Task pane: HTTPS localhost",
);
console.log(
  "Office.js: Microsoft CDN",
);
console.log(
  "Translation boundary: task pane -> Microsoft365 selection service -> SDK",
);
