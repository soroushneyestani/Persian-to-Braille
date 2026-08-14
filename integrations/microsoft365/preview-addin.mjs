import {
  createReadStream,
  existsSync,
} from "node:fs";

import {
  readFile,
  stat,
} from "node:fs/promises";

import {
  createServer,
} from "node:https";

import {
  extname,
  join,
  normalize,
  resolve,
  sep,
} from "node:path";

import {
  homedir,
} from "node:os";

import {
  dirname,
} from "node:path";

import {
  fileURLToPath,
} from "node:url";

const here =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const root =
  resolve(
    here,
    "addin-dist",
  );

const cert =
  process.env.OFFICE_ADDIN_CERT ??
  join(
    homedir(),
    ".office-addin-dev-certs",
    "localhost.crt",
  );

const key =
  process.env.OFFICE_ADDIN_KEY ??
  join(
    homedir(),
    ".office-addin-dev-certs",
    "localhost.key",
  );

const port =
  Number(
    process.env.PORT ??
    "3000",
  );

if (
  !existsSync(cert) ||
  !existsSync(key)
) {
  console.error(
    "Trusted localhost Office development certificate not found.",
  );
  console.error(
    "Run: npx office-addin-dev-certs install",
  );
  console.error(
    `Expected certificate: ${cert}`,
  );
  console.error(
    `Expected key: ${key}`,
  );
  process.exit(2);
}

const contentTypes =
  new Map([
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".png", "image/png"],
    [".xml", "application/xml; charset=utf-8"],
    [".map", "application/json; charset=utf-8"],
  ]);

function safePath(
  urlPath,
) {
  const decoded =
    decodeURIComponent(
      urlPath.split("?")[0],
    );

  const target =
    decoded === "/"
      ? "/taskpane.html"
      : decoded;

  const normalized =
    normalize(target)
      .replace(
        /^(\.\.(\/|\\|$))+/,
        "",
      );

  const absolute =
    resolve(
      root,
      `.${sep}${normalized}`,
    );

  if (
    !absolute.startsWith(
      root,
    )
  ) {
    return null;
  }

  return absolute;
}

const server =
  createServer(
    {
      cert:
        await readFile(
          cert,
        ),
      key:
        await readFile(
          key,
        ),
    },
    async (
      request,
      response,
    ) => {
      try {
        const file =
          safePath(
            request.url ??
            "/",
          );

        if (!file) {
          response.writeHead(400);
          response.end(
            "Bad request",
          );
          return;
        }

        const metadata =
          await stat(file);

        if (!metadata.isFile()) {
          response.writeHead(404);
          response.end(
            "Not found",
          );
          return;
        }

        response.writeHead(
          200,
          {
            "content-type":
              contentTypes.get(
                extname(file),
              ) ??
              "application/octet-stream",
            "cache-control":
              "no-store",
          },
        );

        createReadStream(file)
          .pipe(response);
      } catch {
        response.writeHead(404);
        response.end(
          "Not found",
        );
      }
    },
  );

server.listen(
  port,
  "localhost",
  () => {
    console.log(
      `Persian-to-Braille Word Add-in: https://localhost:${port}`,
    );
    console.log(
      `Task pane: https://localhost:${port}/taskpane.html`,
    );
    console.log(
      "Press Ctrl+C to stop.",
    );
  },
);
