import {
  createReadStream,
} from "node:fs";
import {
  stat,
} from "node:fs/promises";
import http from "node:http";
import {
  extname,
  resolve,
  sep,
} from "node:path";
import {
  dirname,
} from "node:path";
import {
  fileURLToPath,
} from "node:url";

const appDir =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );
const distDir =
  resolve(
    appDir,
    "dist",
  );
const port =
  Number.parseInt(
    process.env["PORT"] ??
      "4173",
    10,
  );

const contentTypes =
  new Map([
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".map", "application/json; charset=utf-8"],
  ]);

function safePath(
  url,
) {
  const pathname =
    decodeURIComponent(
      new URL(
        url,
        "http://localhost",
      ).pathname,
    );

  const relative =
    pathname === "/"
      ? "index.html"
      : pathname.replace(
          /^\/+/,
          "",
        );

  const candidate =
    resolve(
      distDir,
      relative,
    );

  if (
    candidate !== distDir &&
    !candidate.startsWith(
      `${distDir}${sep}`,
    )
  ) {
    return null;
  }

  return candidate;
}

const server =
  http.createServer(
    async (
      request,
      response,
    ) => {
      const path =
        safePath(
          request.url ?? "/",
        );

      if (!path) {
        response.writeHead(
          400,
        );
        response.end(
          "Bad request",
        );
        return;
      }

      try {
        const info =
          await stat(path);

        if (!info.isFile()) {
          throw new Error(
            "Not a file",
          );
        }

        response.writeHead(
          200,
          {
            "Content-Type":
              contentTypes.get(
                extname(path),
              ) ??
              "application/octet-stream",
            "Cache-Control":
              "no-store",
          },
        );

        createReadStream(path)
          .pipe(response);
      } catch {
        response.writeHead(
          404,
          {
            "Content-Type":
              "text/plain; charset=utf-8",
          },
        );
        response.end(
          "Not found",
        );
      }
    },
  );

server.listen(
  port,
  "127.0.0.1",
  () => {
    console.log(
      `Persian Braille Web Playground: http://127.0.0.1:${port}`,
    );
  },
);
