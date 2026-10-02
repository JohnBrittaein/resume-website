// Loads everything under content/ and normalizes it into one "work item" shape
// that every page template understands. See docs/CONTENT.md for the fields.
import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CONTENT, PUBLIC } from "./paths.mjs";
import { isTodo } from "./html.mjs";

export const SECTIONS = ["photography", "music", "art", "video", "work"];
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const warnings = [];
export const warn = (msg) => warnings.push(msg);
export const getWarnings = () => warnings;

async function load(file) {
  // Query string defeats Node's module cache so `npm run dev` picks up edits.
  const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
  return mod.default;
}

// "/images/x.png" -> public/images/x.png; "photos/a.jpg" -> relative to the item folder.
export function resolveAsset(src, dir, label) {
  if (!src || /^https?:/i.test(src)) return null;
  const abs = src.startsWith("/") ? path.join(PUBLIC, src) : path.resolve(dir, src);
  if (!existsSync(abs)) warn(`${label}: file not found: ${src}`);
  return abs;
}

function parseDate(value, label) {
  if (!value) return null;
  const m = String(value).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!m) {
    warn(`${label}: date "${value}" should look like 2026, 2026-09, or 2026-09-14`);
    return null;
  }
  const [, y, mo, d] = m;
  const text = d ? `${MONTHS[+mo - 1]} ${+d}, ${y}` : mo ? `${MONTHS[+mo - 1]} ${y}` : y;
  return { iso: value, year: +y, sort: `${y}-${mo ?? "00"}-${d ?? "00"}`, text };
}

function firstSentence(text) {
  if (!text || isTodo(text)) return "";
  const s = String(text).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}

async function loadPhotoFolder(dir, label) {
  const photosDir = path.join(dir, "photos");
  if (!existsSync(photosDir)) return [];
  const files = (await fs.readdir(photosDir)).filter((f) => IMAGE_EXT.test(f)).sort();
  const sidecarPath = path.join(dir, "photos.json");
  const sidecar = existsSync(sidecarPath) ? JSON.parse(readFileSync(sidecarPath, "utf8")) : [];
  const byFile = new Map(sidecar.map((p) => [p.file, p]));
  // Sidecar order wins; photos not listed there are appended in file-name order.
  const ordered = [...sidecar.map((p) => p.file).filter((f) => files.includes(f)), ...files.filter((f) => !byFile.has(f))];
  return ordered.map((file) => {
    const info = byFile.get(file) ?? {};
    return { src: `photos/${file}`, alt: info.alt, caption: info.caption, span: info.span, hidden: info.hidden };
  });
}

function normalizeImage(img, dir, label, fallbackAlt) {
  const o = typeof img === "string" ? { src: img } : img;
  const abs = resolveAsset(o.src, dir, label);
  return {
    abs,
    src: o.src,
    id: path.basename(o.src, path.extname(o.src)),
    alt: o.alt || fallbackAlt,
    caption: o.caption || "",
    span: o.span || "", // "full" = own row
  };
}

async function normalize(raw, { section, slug, dir, file }) {
  const label = path.relative(CONTENT, file).replace(/\\/g, "/");
  slug = raw.slug || slug;
  const item = {
    ...raw,
    section,
    kind: raw.type || (section === "work" ? "engineering" : section),
    slug,
    url: `/${section}/${slug}/`,
    file: label,
    dir,
    placeholder: !!raw.placeholder,
    draft: !!raw.draft,
    featured: !!raw.featured,
    order: raw.order ?? 999,
    alsoIn: raw.alsoIn || [],
    tags: raw.tags || [],
    skills: raw.skills || [],
    tools: raw.tools || [],
    links: raw.links || [],
    credits: raw.credits || [],
    collaborators: raw.collaborators || [],
    embeds: raw.embeds || [],
  };

  item.date = parseDate(raw.date, label);
  item.dateText = raw.dateLabel || item.date?.text || "";
  item.year = raw.dateLabel || (item.date ? String(item.date.year) : "");

  if (!item.placeholder && !raw.category) warn(`${label}: no category`);

  const fallbackAlt = section === "art" ? `${raw.title}, artwork` : `${raw.title}, photograph`;
  let images = raw.images || [];
  if ((section === "photography" || section === "art") && !raw.images) images = await loadPhotoFolder(dir, label);
  const noAlt = images.filter((im) => typeof im === "string" || !im.alt).length;
  if (noAlt) warn(`${label}: ${noAlt} image(s) without alt text (a generic description is used until you add one)`);
  item.images = images.map((im) => normalizeImage(im, dir, label, fallbackAlt)).filter((im) => !im.hidden);

  if (raw.cover) {
    const byId = item.images.find((im) => im.id === raw.cover || im.src === raw.cover);
    item.cover = byId || normalizeImage({ src: raw.cover, alt: raw.coverAlt || raw.title }, dir, label, raw.title);
    if (raw.coverAlt) item.cover.alt = raw.coverAlt;
    if (!item.cover.alt) item.cover.alt = raw.title;
  } else {
    item.cover = item.images[0] || null;
  }

  item.audio = (raw.audio || []).map((a) => {
    resolveAsset(a.src, dir, label);
    return { ...a, title: a.title || raw.title };
  });
  item.documents = (raw.documents || []).map((d) => {
    resolveAsset(d.file, dir, label);
    return d;
  });

  if (raw.video) {
    const v = typeof raw.video === "string" ? { youtube: raw.video } : raw.video;
    item.video = { aspect: "16/9", title: raw.title, ...v };
  }

  item.summary = raw.summary || firstSentence(raw.description);
  item.lede = raw.summary || "";
  item.inProgress = raw.status === "in-progress";
  item.hasPage = !item.placeholder;
  return item;
}

export async function loadContent({ drafts = false } = {}) {
  warnings.length = 0;
  const site = await load(path.join(CONTENT, "site.js"));
  const about = await load(path.join(CONTENT, "about.js"));
  const items = [];

  for (const section of SECTIONS) {
    const dir = path.join(CONTENT, section);
    if (!existsSync(dir)) continue;
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
      let file, itemDir, slug;
      if (entry.isDirectory()) {
        file = path.join(dir, entry.name, "index.js");
        if (!existsSync(file)) continue;
        itemDir = path.join(dir, entry.name);
        slug = entry.name;
      } else if (entry.name.endsWith(".js")) {
        file = path.join(dir, entry.name);
        itemDir = dir;
        slug = entry.name.replace(/\.js$/, "");
      } else continue;
      const raw = await load(file);
      if (!raw?.title) {
        warn(`${path.relative(CONTENT, file)}: missing title, skipped`);
        continue;
      }
      items.push(await normalize(raw, { section, slug, dir: itemDir, file }));
    }
  }

  const visible = items.filter((i) => (drafts || !i.draft) && (site.showPlaceholders || !i.placeholder));

  for (const i of visible) {
    const cats = site.categories[i.section] || [];
    const cat = cats.find((c) => c.slug === i.category);
    if (i.category && !cat) warn(`${i.file}: category "${i.category}" isn't listed in content/site.js`);
    i.categoryLabel = cat?.label || "";
  }

  return { site, about, items: visible.sort(byDate) };
}

// Newest first; undated items after dated ones, then by `order`.
export function byDate(a, b) {
  if (a.date && b.date && a.date.sort !== b.date.sort) return a.date.sort < b.date.sort ? 1 : -1;
  if (!!a.date !== !!b.date) return a.date ? -1 : 1;
  return a.order - b.order || a.title.localeCompare(b.title);
}
