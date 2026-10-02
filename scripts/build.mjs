// Builds the static site into dist/.
//
//   npm run build            production build
//   npm run build:drafts     include items marked draft: true
//
// Environment:
//   SITE_URL   origin for canonical/OG URLs (default: CF_PAGES_URL, then site.url)
//   BASE_PATH  URL prefix, e.g. "/resume-website/" for github.io project pages (default "/")
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { ROOT, DIST, PUBLIC, configure, abs, url, basePath } from "./lib/paths.mjs";
import { loadContent, resolveAsset, getWarnings, warn } from "./lib/content.mjs";
import { initImages, processAll, ogImage, emitImages } from "./lib/images.mjs";
import { setImageMeta } from "../src/components/media.mjs";
import { layout } from "../src/layout.mjs";
import { homePage } from "../src/pages/home.mjs";
import { photographyIndex, photographyProject } from "../src/pages/photography.mjs";
import { musicIndex, musicItem } from "../src/pages/music.mjs";
import { videoIndex, videoItem } from "../src/pages/video.mjs";
import { workIndex, workItem } from "../src/pages/work.mjs";
import { aboutPage } from "../src/pages/about.mjs";
import { artIndex, artItem } from "../src/pages/art.mjs";
import { contactPage, photoInquiryPage, notFoundPage } from "../src/pages/contact.mjs";

// Load order matters: later files override earlier ones.
const CSS_FILES = ["tokens.css", "base.css", "layout.css", "components.css", "pages.css"];
const JS_FILES = ["nav.js", "lightbox.js", "filters.js", "video.js", "audio.js", "forms.js"];

export async function build({ drafts = process.argv.includes("--drafts"), quiet = false } = {}) {
  const t0 = Date.now();
  const { site, about, items } = await loadContent({ drafts });

  configure({
    basePath: process.env.BASE_PATH || "/",
    siteUrl: process.env.SITE_URL || process.env.CF_PAGES_URL || site.url,
  });

  // 1. Clean output, then mirror public/ (hard links: instant, no extra disk).
  await fs.rm(DIST, { recursive: true, force: true });
  await mirror(PUBLIC, DIST);

  // 2. Images: gather every referenced image and make responsive variants.
  await initImages();
  const hero = (site.hero || []).map((h) => ({ ...h, abs: resolveAsset(h.src, ROOT, "content/site.js hero") }));
  const portrait = site.portrait ? { src: site.portrait, alt: "Portrait of John Brittain", abs: resolveAsset(site.portrait, ROOT, "content/site.js portrait") } : null;
  const musicBanner = site.musicBanner ? { src: site.musicBanner, alt: "", abs: resolveAsset(site.musicBanner, ROOT, "content/site.js musicBanner") } : null;
  const all = [...hero, portrait, musicBanner, ...items.flatMap((i) => [...i.images, i.cover])].filter((im) => im?.abs && existsSync(im.abs));
  const meta = await processAll(all.map((im) => im.abs));
  setImageMeta(meta);

  // Social preview images: each item's cover, cropped to 1200x630.
  const toOg = async (im) => {
    if (!im?.abs || !meta.has(im.abs)) return null;
    const o = await ogImage(im.abs);
    return { url: `/img/${o.file}`, width: o.width, height: o.height, alt: im.alt };
  };
  for (const item of items) {
    item.og = (await toOg(item.cover)) || (item.video?.youtube ? { url: `https://i.ytimg.com/vi/${item.video.youtube}/hqdefault.jpg`, width: 480, height: 360, alt: item.title } : null);
  }
  const defaultOg = await toOg(items.find((i) => i.section === "photography" && i.cover)?.cover || hero.find((h) => meta.has(h.abs)));
  const portraitOg = await toOg(portrait);

  // 3. CSS + JS bundles (plain concatenation, content-hashed file names).
  const css = await bundle("src/styles", CSS_FILES, "css");
  const js = await bundle("src/js", JS_FILES, "js");

  // 4. Pages.
  const ctx = { site, about, items, hero: hero.filter((h) => meta.has(h.abs)), portrait: portrait && meta.has(portrait.abs) ? portrait : null, portraitOg, musicBanner: musicBanner && meta.has(musicBanner.abs) ? musicBanner : null, absUrl: abs };
  const pages = [
    homePage(ctx),
    photographyIndex(ctx),
    musicIndex(ctx),
    artIndex(ctx),
    videoIndex(ctx),
    workIndex(ctx),
    aboutPage(ctx),
    contactPage(ctx),
    photoInquiryPage(ctx),
    notFoundPage(ctx),
  ];
  for (const item of items.filter((i) => i.hasPage)) {
    if (item.section === "photography") pages.push(photographyProject(ctx, item));
    if (item.section === "music") pages.push(musicItem(ctx, item));
    if (item.section === "art") pages.push(artItem(ctx, item));
    if (item.section === "video") pages.push(videoItem(ctx, item));
    if (item.section === "work") pages.push(workItem(ctx, item));
  }

  const assets = { css, js, defaultOg };
  for (const page of pages) {
    const out = page.path.endsWith(".html") ? path.join(DIST, page.path) : path.join(DIST, page.path, "index.html");
    await fs.mkdir(path.dirname(out), { recursive: true });
    let doc = String(layout(site, page, assets));
    if (page.noindex) doc = doc.replace("<head>", '<head>\n<meta name="robots" content="noindex">');
    await fs.writeFile(out, doc);
  }

  // 5. sitemap.xml + robots.txt
  const listed = pages.filter((p) => !p.noindex);
  await fs.writeFile(
    path.join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((p) => `  <url><loc>${abs(p.path)}</loc></url>`).join("\n")}\n</urlset>\n`
  );
  const AI_BOTS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "anthropic-ai", "Claude-Web", "CCBot", "Google-Extended", "Applebot-Extended", "Bytespider", "PerplexityBot", "meta-externalagent", "Diffbot", "Omgilibot", "img2dataset"];
  await fs.writeFile(
    path.join(DIST, "robots.txt"),
    `# AI training crawlers: please don't use this site's photos or text.\n${AI_BOTS.map((b) => `User-agent: ${b}\nDisallow: /\n`).join("\n")}\nUser-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`
  );

  // 6. Copy the image variants pages actually used.
  const nImages = await emitImages(path.join(DIST, "img"));

  if (!quiet) {
    const ws = getWarnings();
    console.log(`Built ${pages.length} pages, ${nImages} image files, ${items.length} items in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    console.log(`  base ${basePath()}  →  ${abs("/")}`);
    if (ws.length) console.log(`\n${ws.length} content warning(s):\n  - ${[...new Set(ws)].join("\n  - ")}`);
  }
  return { pages: pages.length };
}

async function mirror(from, to) {
  await fs.mkdir(to, { recursive: true });
  for (const e of await fs.readdir(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) await mirror(a, b);
    else {
      try {
        await fs.link(a, b);
      } catch {
        await fs.copyFile(a, b);
      }
    }
  }
}

async function bundle(dir, files, ext) {
  const parts = [];
  for (const f of files) parts.push(`/* ${f} */\n` + (await fs.readFile(path.join(ROOT, dir, f), "utf8")));
  let code = parts.join("\n");
  if (ext === "js") code = `(() => {\n"use strict";\nconst BASE = ${JSON.stringify(basePath())};\n${code}\n})();\n`;
  const hash = crypto.createHash("sha1").update(code).digest("hex").slice(0, 10);
  const rel = `/assets/site.${hash}.${ext}`;
  await fs.mkdir(path.join(DIST, "assets"), { recursive: true });
  await fs.writeFile(path.join(DIST, rel), code);
  return rel;
}

// Run when invoked directly (not when imported by dev.mjs).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { warn, url };
