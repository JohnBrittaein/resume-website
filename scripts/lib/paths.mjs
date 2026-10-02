// URL helpers that respect the deploy location.
//   BASE_PATH: "/" on Cloudflare Pages or a custom domain; "/resume-website/" on
//              github.io project pages.
//   SITE_URL:  origin used for canonical URLs, Open Graph, and the sitemap.
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const DIST = path.join(ROOT, "dist");
export const PUBLIC = path.join(ROOT, "public");
export const CONTENT = path.join(ROOT, "content");
export const CACHE = path.join(ROOT, ".cache");

let base = "/";
let origin = "http://localhost:8080";

export function configure({ basePath = "/", siteUrl }) {
  base = ("/" + basePath + "/").replace(/\/+/g, "/");
  if (siteUrl) origin = siteUrl.replace(/\/+$/, "");
}

export const basePath = () => base;
export const siteOrigin = () => origin;

// "/music/" -> "/resume-website/music/" (external URLs pass through).
export function url(p) {
  if (!p) return p;
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(p)) return p;
  if (!p.startsWith("/")) return p;
  return base + encodeURI(decodeURI(p.slice(1)));
}

// Absolute URL for canonical / Open Graph / sitemap.
export const abs = (p) => (/^https?:/i.test(p) ? p : origin + url(p));
