// Import a folder of selected photographs as a photography project.
//
//   npm run photos:import -- "images/photos/_selects/Grifter Ball 2026"
//   npm run photos:import -- "<folder>" --slug grifter-ball-2026 --category concerts --title "Grifter Ball"
//   npm run photos:import -- "<folder of artwork>" --section art --category collage
//
// For every JPEG/PNG/TIFF in <folder> it writes a web master to
// content/photography/<slug>/photos/<name>.jpg:
//   - long edge 2560 px, JPEG quality 86 (the build makes smaller WebP sizes from it)
//   - EXIF rotation applied, then ALL metadata removed (including GPS location)
//   - converted to sRGB
// It also creates/updates:
//   - photos.json   order, alt text, and captions for each photo (fill in the alt text!)
//   - index.js      project metadata (only if it doesn't exist yet), with the
//                   date taken from the photos' EXIF capture date
//
// Originals are never modified or copied into the repo. Re-running skips photos
// that were already imported (pass --force to re-encode them).
//
// To import only some photos (e.g. your selects from a big shoot, including
// photos in subfolders), pass --list with a text file of paths relative to
// <folder>, one per line, in gallery order:
//   npm run photos:import -- "E:/Edited Photos/Grifter Ball 2026" --list picks.txt
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CONTENT } from "./lib/paths.mjs";

const LONG_EDGE = 2560;
const QUALITY = 86;
const INPUT = /\.(jpe?g|png|tiff?)$/i;

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const source = args.find((a, i) => !a.startsWith("--") && !(args[i - 1]?.startsWith("--") && args[i - 1] !== "--force"));
if (!source || !existsSync(source)) {
  console.error('Usage: npm run photos:import -- "<folder of selected photos>" [--slug s] [--title t] [--category c] [--force]');
  process.exit(1);
}

const folderName = path.basename(path.resolve(source));
const slug = flag("slug") || folderName.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
const title = flag("title") || folderName;
const category = flag("category") || "";
const force = args.includes("--force");
const section = flag("section") || "photography"; // or "art"

const projectDir = path.join(CONTENT, section, slug);
const photosDir = path.join(projectDir, "photos");
await fs.mkdir(photosDir, { recursive: true });

const listFile = flag("list");
const files = listFile
  ? (await fs.readFile(listFile, "utf8")).split("\n").map((l) => l.trim()).filter(Boolean)
  : (await fs.readdir(source)).filter((f) => INPUT.test(f)).sort();
for (const f of files) {
  if (!existsSync(path.join(source, f))) {
    console.error(`Not found: ${path.join(source, f)}`);
    process.exit(1);
  }
}
if (!files.length) {
  console.error(`No JPEG/PNG/TIFF files in ${source}`);
  process.exit(1);
}

// Capture date from EXIF (DateTimeOriginal is stored as "YYYY:MM:DD HH:MM:SS").
const exifDate = (buf) => {
  const m = buf?.toString("latin1").match(/(\d{4}):(\d{2}):(\d{2}) \d{2}:\d{2}:\d{2}/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
};

const dates = [];
const imported = [];
let skipped = 0;
for (const [n, file] of files.entries()) {
  const outName = `${path.basename(file, path.extname(file))}.jpg`;
  const out = path.join(photosDir, outName);
  const input = path.join(source, file);
  const meta = await sharp(input).metadata();
  const d = exifDate(meta.exif);
  if (d) dates.push(d);
  imported.push(outName);
  if (existsSync(out) && !force) {
    skipped++;
    continue;
  }
  await sharp(input, { failOn: "none" })
    .rotate() // bake in EXIF orientation; metadata is dropped on output by default
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
    .toColorspace("srgb")
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(out);
  const kb = Math.round((await fs.stat(out)).size / 1024);
  console.log(`  [${n + 1}/${files.length}] ${outName}  ${kb} KB`);
}

// photos.json: keep existing entries (and their order/alt text), append new ones.
const sidecarPath = path.join(projectDir, "photos.json");
const onDisk = new Set((await fs.readdir(photosDir)).filter((f) => /\.jpe?g$/i.test(f)));
// Drop entries for files that were renamed or deleted in photos/.
const sidecar = (existsSync(sidecarPath) ? JSON.parse(await fs.readFile(sidecarPath, "utf8")) : []).filter((p) => onDisk.has(p.file));
const known = new Set(sidecar.map((p) => p.file));
for (const f of imported) if (!known.has(f)) sidecar.push({ file: f, alt: "", caption: "" });
await fs.writeFile(sidecarPath, JSON.stringify(sidecar, null, 2) + "\n");

// index.js scaffold, only on first import.
const indexPath = path.join(projectDir, "index.js");
if (!existsSync(indexPath)) {
  const date = dates.sort()[0] || "";
  await fs.writeFile(
    indexPath,
    `export default {
  title: ${JSON.stringify(title)},
  category: ${JSON.stringify(category)}, // must match a slug in content/site.js → categories.${section}
  date: ${JSON.stringify(date)}, // from the photos' capture date; "2026-09" or "2026" also work
  location: "", // [ADD LOCATION]
  description: "[ADD DESCRIPTION]",
  // cover: "${path.basename(imported[0], ".jpg")}", // file name of the cover photo (default: first)
  // featured: true, // show on the homepage
  // links: [{ label: "Band on Instagram", url: "https://instagram.com/…" }],
  // credits: [{ role: "Photography", name: "John Brittain" }],
};
`
  );
}

const missingAlt = sidecar.filter((p) => !p.alt).length;
console.log(`
Imported ${imported.length - skipped} image(s) into content/${section}/${slug}/ (${skipped} already there).
Next:
  1. Edit content/${section}/${slug}/index.js (title, category, location, description).
  2. Write alt text for each image in content/${section}/${slug}/photos.json${missingAlt ? ` (${missingAlt} missing)` : ""}.
     Reorder the entries there to change the gallery order; add "span": "full" to give an image its own row.
  3. npm run dev   and look at http://localhost:8080/${section}/${slug}/
`);
