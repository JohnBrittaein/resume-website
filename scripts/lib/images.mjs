// Responsive image pipeline. For every source image referenced by content it
// produces WebP variants (480/960/1600/2400 px wide, never upscaled), reads the
// dimensions and an average color (shown while the image loads), and on
// request a 1200x630 JPEG for social previews.
//
// Results are cached in .cache/images keyed by path + size + mtime, so only
// new or changed images are re-encoded.
import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { CACHE, ROOT } from "./paths.mjs";

// Written into every image the site serves (and nothing else: no GPS, camera, or dates).
const OWNER = "John Brittain";
const COPYRIGHT = { IFD0: { Artist: OWNER, Copyright: `(c) ${new Date().getFullYear()} ${OWNER}. All rights reserved.` } };

const WIDTHS = [480, 960, 1600, 2400];
const QUALITY = 78;
const VERSION = 3; // bump to invalidate the cache after changing encoding settings
const DIR = path.join(CACHE, "images");
const MANIFEST = path.join(DIR, "manifest.json");

sharp.concurrency(2);

let manifest = {};
const pending = new Map();
const used = new Set();

export async function initImages() {
  await fs.mkdir(DIR, { recursive: true });
  manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  // Forget entries whose files were deleted.
  for (const [key, e] of Object.entries(manifest)) if (!e.variants.every((v) => existsSync(path.join(DIR, v.file)))) delete manifest[key];
}

async function keyFor(abs) {
  const st = await fs.stat(abs);
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  const hash = crypto.createHash("sha1").update(`${rel}|${st.size}|${st.mtimeMs}|${VERSION}`).digest("hex").slice(0, 12);
  const stem = path.basename(abs, path.extname(abs)).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  return `${stem}-${hash}`;
}

async function build(abs) {
  const key = await keyFor(abs);
  const cached = manifest[key];
  if (cached && cached.variants.every((v) => existsSync(path.join(DIR, v.file)))) return cached;

  const animated = /\.gif$/i.test(abs);
  const img = sharp(abs, { failOn: "none", animated }).rotate();
  const meta = await img.metadata();
  if (meta.pageHeight) meta.height = meta.pageHeight; // animated: height of one frame
  // .rotate() applies EXIF orientation, so swap dimensions for 90° rotations.
  const turned = (meta.orientation ?? 1) >= 5;
  const width = turned ? meta.height : meta.width;
  const height = turned ? meta.width : meta.height;

  const widths = WIDTHS.filter((w) => w < width);
  if (widths.length < WIDTHS.length) widths.push(Math.min(width, WIDTHS.at(-1)));

  const variants = [];
  for (const w of [...new Set(widths)]) {
    const file = `${key}-${w}.webp`;
    await img
      .clone()
      .resize({ width: w, withoutEnlargement: true })
      .withExif(COPYRIGHT)
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(path.join(DIR, file));
    variants.push({ w, file });
  }

  const { data } = await sharp(path.join(DIR, variants[0].file), { pages: 1 }).resize(1, 1, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const color = `#${[...data.subarray(0, 3)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;

  const entry = { key, width, height, color, variants };
  manifest[key] = entry;
  return entry;
}

// Process (or fetch from cache) one image. Safe to call repeatedly.
export function processImage(abs) {
  if (!pending.has(abs)) pending.set(abs, build(abs));
  return pending.get(abs);
}

export async function processAll(paths, limit = 3) {
  const list = [...new Set(paths)];
  let i = 0;
  const results = new Map();
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < list.length) {
        const p = list[i++];
        results.set(p, await processImage(p));
      }
    })
  );
  return results;
}

// 1200x630 JPEG for Open Graph / Twitter cards.
export async function ogImage(abs) {
  const entry = await processImage(abs);
  const file = `${entry.key}-og.jpg`;
  const out = path.join(DIR, file);
  if (!existsSync(out)) {
    await sharp(abs, { failOn: "none", pages: 1 })
      .rotate()
      .resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })
      .flatten({ background: "#111111" })
      .withExif(COPYRIGHT)
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
  }
  used.add(file);
  return { file, width: 1200, height: 630 };
}

export function markUsed(entry) {
  for (const v of entry.variants) used.add(v.file);
}

// Copy (hard-link when possible) every variant a page referenced into dist/img.
export async function emitImages(distImgDir) {
  await fs.mkdir(distImgDir, { recursive: true });
  for (const file of used) {
    const from = path.join(DIR, file);
    const to = path.join(distImgDir, file);
    try {
      await fs.link(from, to);
    } catch {
      await fs.copyFile(from, to);
    }
  }
  await fs.writeFile(MANIFEST, JSON.stringify(manifest));
  return used.size;
}
