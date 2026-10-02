// Page shell: <head> metadata, header/navigation, footer.
import { html, raw, esc } from "../scripts/lib/html.mjs";
import { url, abs } from "../scripts/lib/paths.mjs";

export const NAV = [
  { label: "Photography", href: "/photography/", section: "photography" },
  { label: "Music", href: "/music/", section: "music" },
  { label: "Art", href: "/art/", section: "art" },
  { label: "Video", href: "/video/", section: "video" },
  { label: "Work", href: "/work/", section: "work" },
  { label: "About", href: "/about/", section: "about" },
  { label: "Contact", href: "/contact/", section: "contact" },
];

const THEME_COLOR = { crt: "#0a0e27", dark: "#0a0a0a", music: "#1a0b2e", work: "#0d3170", art: "#1d1a17" };

const FONTS =
  "https://fonts.googleapis.com/css2?family=Inconsolata:wght@400..900&display=swap";

function csp(site) {
  let formOrigin = "";
  try {
    formOrigin = [...new Set(Object.values(site.forms || {}).filter(Boolean).map((u) => new URL(u).origin))].map((o) => " " + o).join("");
  } catch {}
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://i.ytimg.com",
    "media-src 'self'",
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://bandcamp.com https://w.soundcloud.com https://open.spotify.com",
    `connect-src 'self'${formOrigin}`,
    `form-action 'self' mailto:${formOrigin}`,
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
}

export function layout(site, page, assets) {
  const title = page.title ? `${page.title} — ${site.name}` : `${site.name} — ${site.tagline}`;
  const description = page.description || site.description;
  const canonical = abs(page.path);
  const theme = page.theme || "crt";
  const og = page.og || assets.defaultOg;
  const year = new Date().getFullYear();
  const socials = site.socials.filter((s) => s.url);

  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta http-equiv="Content-Security-Policy" content="${csp(site)}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="${THEME_COLOR[theme] || THEME_COLOR.crt}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:title" content="${page.title || site.name}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
${og ? html`<meta property="og:image" content="${abs(og.url)}">
<meta property="og:image:width" content="${og.width}">
<meta property="og:image:height" content="${og.height}">
<meta property="og:image:alt" content="${og.alt || ""}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${page.title || site.name}">
<meta name="twitter:description" content="${description}">
${og ? html`<meta name="twitter:image" content="${abs(og.url)}">` : ""}
<link rel="icon" href="${url("/favicon.svg")}" type="image/svg+xml">
<link rel="manifest" href="${url("/manifest.json")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${url(assets.css)}">
<script src="${url(assets.js)}" defer></script>
${page.jsonld ? html`<script type="application/ld+json">${raw(JSON.stringify(page.jsonld).replace(/</g, "\\u003c"))}</script>` : ""}
</head>
<body data-theme="${theme}" data-section="${page.section || ""}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="wordmark" href="${url("/")}"${page.path === "/" ? raw(' aria-current="page"') : ""}>${site.name}</a>
    <nav class="nav" aria-label="Main">
      <ul>
        ${NAV.map((n) => html`<li><a href="${url(n.href)}"${n.section === page.section ? raw(' aria-current="page"') : ""}>${n.label}</a></li>`)}
      </ul>
    </nav>
    <button class="menu-btn mono" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-btn__open">Menu</span><span class="menu-btn__close">Close</span></button>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <nav aria-label="Main (mobile)">
    <ol class="menu__list">
      ${NAV.map((n, i) => html`<li><a href="${url(n.href)}"${n.section === page.section ? raw(' aria-current="page"') : ""}><span class="menu__n mono">${String(i + 1).padStart(2, "0")}</span>${n.label}</a></li>`)}
    </ol>
  </nav>
  <div class="menu__foot mono">
    <a href="mailto:${site.email}">${site.email}</a>
    ${socials.map((s) => html`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`)}
  </div>
</div>
<main id="main" tabindex="-1">
${page.body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__top">
      <a class="site-footer__mail" href="mailto:${site.email}">${site.email}</a>
    </div>
    <div class="site-footer__cols mono">
      <ul aria-label="Sections">
        ${NAV.map((n) => html`<li><a href="${url(n.href)}">${n.label}</a></li>`)}
      </ul>
      <ul aria-label="Elsewhere">
        ${socials.map((s) => html`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ↗</a></li>`)}
        <li><a href="${url(site.resume)}" target="_blank" rel="noopener">Résumé (PDF) ↗</a></li>
      </ul>
      <ul>
        <li>© ${year} ${site.name}. All rights reserved.</li>
        <li>${site.location}</li>
        <li><a href="${site.repo}" target="_blank" rel="noopener noreferrer">Source on GitHub ↗</a></li>
      </ul>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

export { esc };
