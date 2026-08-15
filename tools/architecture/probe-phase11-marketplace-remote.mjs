const DEFAULT_BASE_URL =
  "https://soroushneyestani.github.io/Persian-to-Braille";

const input =
  process.argv[2] ??
  process.env.OFFICE_ADDIN_PRODUCTION_BASE_URL ??
  DEFAULT_BASE_URL;

const baseUrl =
  new URL(
    input.endsWith("/")
      ? input
      : `${input}/`,
  );

if (
  baseUrl.protocol !== "https:"
) {
  throw new Error(
    "Remote Marketplace probe requires HTTPS.",
  );
}

const endpoints = [
  {
    path: "taskpane.html",
    type: "text/html",
    contains:
      "https://appsforoffice.microsoft.com/lib/1/hosted/office.js",
  },
  {
    path: "commands.html",
    type: "text/html",
  },
  {
    path: "styles.css",
    type: "text/css",
  },
  {
    path: "assets/icon-16.png",
    type: "image/png",
    cache: true,
  },
  {
    path: "assets/icon-32.png",
    type: "image/png",
    cache: true,
  },
  {
    path: "assets/icon-80.png",
    type: "image/png",
    cache: true,
  },
];

let failures = 0;

for (
  const endpoint of endpoints
) {
  const url =
    new URL(
      endpoint.path,
      baseUrl,
    );

  let response;

  try {
    response =
      await fetch(
        url,
        {
          redirect: "follow",
        },
      );
  } catch (error) {
    failures += 1;
    console.error(
      `[FAIL] ${url}: ${error.message}`,
    );
    continue;
  }

  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  const cacheControl =
    response.headers.get(
      "cache-control",
    ) ?? "";

  if (!response.ok) {
    failures += 1;
    console.error(
      `[FAIL] ${url}: HTTP ${response.status}`,
    );
    continue;
  }

  if (
    !response.url.startsWith(
      "https://",
    )
  ) {
    failures += 1;
    console.error(
      `[FAIL] ${url}: final URL is not HTTPS (${response.url})`,
    );
    continue;
  }

  if (
    !contentType
      .toLowerCase()
      .includes(
        endpoint.type,
      )
  ) {
    failures += 1;
    console.error(
      `[FAIL] ${url}: content-type ${JSON.stringify(contentType)} does not include ${endpoint.type}`,
    );
    continue;
  }

  if (endpoint.contains) {
    const body =
      await response.text();

    if (
      !body.includes(
        endpoint.contains,
      )
    ) {
      failures += 1;
      console.error(
        `[FAIL] ${url}: required content token missing`,
      );
      continue;
    }
  } else {
    await response.arrayBuffer();
  }

  if (
    endpoint.cache &&
    cacheControl.trim() === ""
  ) {
    failures += 1;
    console.error(
      `[FAIL] ${url}: icon response has no cache-control header`,
    );
    continue;
  }

  console.log(
    `[PASS] ${url}`,
  );

  if (endpoint.cache) {
    console.log(
      `       cache-control: ${cacheControl}`,
    );
  }
}

if (failures > 0) {
  throw new Error(
    `Remote Marketplace probe failed: ${failures} endpoint(s).`,
  );
}

console.log();
console.log(
  "Phase 11.2b remote Marketplace HTTPS probe: PASS",
);
console.log(
  `Origin: ${baseUrl.href.replace(/\/$/, "")}`,
);
console.log(
  "Task pane Office.js CDN: PASS",
);
console.log(
  "Required static endpoints: PASS",
);
console.log(
  "Icon cache headers: PASS",
);
