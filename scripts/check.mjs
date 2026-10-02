// Sanity checks on the built site (run `npm run build` first):
//   - every internal link, image, script, and stylesheet resolves to a file in dist/
//   - every page has one <h1>, a unique <title>, a meta description, and a canonical URL
//   - every <img> has an alt attribute
//
//   npm run check                 internal checks only
//   npm run check -- --external   also request every external link (slower)
import fs from "node:fs";
import path from "node:path";
import { DIST } from "./lib/paths.mjs";

const base = ("/" + (process.env.BASE_PATH || "/") + "/").replace(/\/+/g, "/");
const external = process.argv.includes("--external");

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(DIST);

const problems = [];
const titles = new Map();
const externals = new Map();

for (const file of pages) {
  const rel = "/" + path.relative(DIST, file).replace(/\\/g, "/");
  const doc = fs.readFileSync(file, "utf8");
  const h1s = (doc.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${rel}: ${h1s} <h1> elements`);
  const title = doc.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) problems.push(`${rel}: no <title>`);
  else if (titles.has(title)) problems.push(`${rel}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, rel);
  if (!/<meta name="description" content="[^"]+"/.test(doc)) problems.push(`${rel}: no meta description`);
  if (!rel.endsWith("404.html") && !/<link rel="canonical"/.test(doc)) problems.push(`${rel}: no canonical link`);
  for (const img of doc.match(/<img\b[^>]*>/g) || []) if (!/\balt="/.test(img)) problems.push(`${rel}: <img> without alt: ${img.slice(0, 80)}`);

  const refs = [...doc.matchAll(/\s(?:href|src|data-embed)="([^"]+)"/g), ...doc.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) =>
    m[0].includes("srcset") ? m[1].split(",").map((s) => s.trim().split(/\s+/)[0]) : [m[1]]
  );
  for (let ref of refs) {
    ref = ref.replace(/&amp;/g, "&");
    if (/^(mailto:|tel:|#|data:)/.test(ref)) continue;
    if (/^https?:/.test(ref)) {
      // Skip fonts and the site's own absolute URLs (canonical / Open Graph).
      if (!ref.startsWith("https://fonts.") && !(process.env.SITE_URL && ref.startsWith(process.env.SITE_URL))) externals.set(ref, rel);
      continue;
    }
    if (!ref.startsWith(base)) {
      problems.push(`${rel}: link not under base path ${base}: ${ref}`);
      continue;
    }
    const clean = decodeURIComponent(ref.slice(base.length).split(/[?#]/)[0]);
    let target = path.join(DIST, clean);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target)) problems.push(`${rel}: broken link ${ref}`);
  }
}

if (external) {
  console.log(`Checking ${externals.size} external URLs…`);
  // A few at a time: some hosts throttle bursts of requests.
  const queue = [...externals];
  const worker = async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      const [u, from] = next;
      try {
        let res = await fetch(u, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(15000) });
        if (res.status === 405 || res.status === 403) res = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(15000) });
        // LinkedIn answers automated requests with 999; that isn't a broken link.
        if (res.status >= 400 && !(res.status === 999 && u.includes("linkedin.com"))) problems.push(`${from}: external ${res.status} ${u}`);
      } catch (err) {
        problems.push(`${from}: external request failed (${err.cause?.code || err.name}) ${u}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
}

console.log(`Checked ${pages.length} pages${external ? ` and ${externals.size} external links` : ""}.`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
} else console.log("No problems found.");
