// Local preview: builds the site, serves dist/ at http://localhost:8080, and
// rebuilds when anything in content/, src/, public/, or scripts/lib changes.
// Refresh the browser after a rebuild.
//
//   npm run dev              drafts included
//   PORT=3000 npm run dev
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, DIST } from "./lib/paths.mjs";

const PORT = +process.env.PORT || 8080;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

process.env.SITE_URL ||= `http://localhost:${PORT}`;
// Each rebuild runs in a fresh process so edits to templates in src/ are picked up.
const build = () => spawnSync(process.execPath, [path.join(ROOT, "scripts/build.mjs"), "--drafts"], { stdio: "inherit", env: process.env });
build();

let timer = null;
let building = false;
const onChange = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (building) return;
    building = true;
    build();
    building = false;
  }, 150);
};
// OneDrive sync can make Windows file watchers error out; log it and re-arm
// instead of letting the preview server die.
const watch = (dir) => {
  const w = fs.watch(path.join(ROOT, dir), { recursive: true }, onChange);
  w.on("error", (err) => {
    console.warn(`  (watcher on ${dir} restarted: ${err.code || err.message})`);
    w.close();
    setTimeout(() => watch(dir), 1000);
  });
};
for (const dir of ["content", "src", "public", "scripts/lib"]) watch(dir);
process.on("uncaughtException", (err) => console.error("  (preview kept running after an error)", err));

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(DIST, p);
    if (!file.startsWith(DIST)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "content-type": TYPES[".html"] });
      return fs.createReadStream(path.join(DIST, "404.html")).pipe(res);
    }
    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    const size = fs.statSync(file).size;
    // Range requests, so audio scrubbing works locally.
    const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = range[1] ? +range[1] : 0;
      const end = range[2] ? +range[2] : size - 1;
      res.writeHead(206, { "content-type": type, "content-range": `bytes ${start}-${end}/${size}`, "accept-ranges": "bytes", "content-length": end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { "content-type": type, "content-length": size, "accept-ranges": "bytes" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`\n  Preview: http://localhost:${PORT}/\n`));
