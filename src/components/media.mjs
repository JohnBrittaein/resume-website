// Media building blocks: responsive images, justified galleries, placeholder
// frames, click-to-load video, and audio players.
import { html, raw, esc } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { markUsed } from "../../scripts/lib/images.mjs";

let registry = new Map();
export const setImageMeta = (map) => (registry = map);
export const imageMeta = (abs) => registry.get(abs);

const imgUrl = (file) => url(`/img/${file}`);

// <img> with srcset. `sizes` describes the rendered width so the browser picks
// the smallest adequate file.
export function picture(image, { sizes = "100vw", eager = false, className = "", alt } = {}) {
  const m = image && registry.get(image.abs);
  if (!m) return placeholderFrame({ label: "[MISSING IMAGE]", ratio: 1.5 });
  markUsed(m);
  const mid = m.variants.find((v) => v.w >= 960) || m.variants.at(-1);
  return html`<img class="${className}" src="${imgUrl(mid.file)}" srcset="${m.variants.map((v) => `${imgUrl(v.file)} ${v.w}w`).join(", ")}" sizes="${sizes}" width="${m.width}" height="${m.height}" alt="${alt ?? image.alt ?? ""}" ${raw(eager ? 'fetchpriority="high"' : 'loading="lazy"')} decoding="async" style="background-color:${m.color}">`;
}

export const ratioOf = (image) => {
  const m = image && registry.get(image.abs);
  return m ? +(m.width / m.height).toFixed(4) : 1.5;
};

// Largest variant, used by the lightbox and as the no-JavaScript link target.
export function fullSize(image) {
  const m = registry.get(image.abs);
  return m ? imgUrl(m.variants.at(-1).file) : "";
}

// An image that opens the lightbox. `group` ties images together for prev/next.
export function zoomable(image, { group, sizes, eager, className } = {}) {
  const m = registry.get(image.abs);
  if (!m) return picture(image);
  return html`<a class="zoom" href="${fullSize(image)}" data-lightbox="${group}" data-srcset="${m.variants.map((v) => `${imgUrl(v.file)} ${v.w}w`).join(", ")}" data-caption="${image.caption || ""}" data-alt="${image.alt}" data-w="${m.width}" data-h="${m.height}">${picture(image, { sizes, eager, className })}<span class="visually-hidden">View larger</span></a>`;
}

// Justified rows: every image keeps its own aspect ratio; rows fill the width.
// Portrait and landscape mix freely; span: "full" gives an image its own row.
export function gallery(images, { group = "gallery", row = 340, variant = "", captions = true, hero = false } = {}) {
  return html`<div class="justify ${variant}" style="--row:${row}px">
    ${images.map((im, i) => {
      // Optional hero: the first landscape frame gets a row to itself.
      if (hero && i === 0 && ratioOf(im) >= 1.3) im = { ...im, span: "full" };
      const ar = ratioOf(im);
      return html`<figure class="justify__item${im.span === "full" ? " justify__item--full" : ""}" style="--ar:${ar}">
        ${zoomable(im, { group, sizes: im.span === "full" ? "100vw" : `(max-width: 640px) 100vw, ${Math.round(Math.min(ar, 2.5) * row * 1.1)}px` })}
        ${captions && im.caption ? html`<figcaption class="justify__cap">${im.caption}</figcaption>` : ""}
      </figure>`;
    })}
  </div>`;
}

// Clearly-marked empty slot for content that doesn't exist yet.
export function placeholderFrame({ label = "[ADD PHOTOGRAPH]", ratio = 1.5, note = "" } = {}) {
  return html`<div class="ph" style="--ar:${ratio}" role="img" aria-label="Placeholder: ${label}">
    <span class="ph__label">${label}</span>${note ? html`<span class="ph__note">${note}</span>` : ""}
  </div>`;
}

// YouTube / Vimeo. Shows a thumbnail and only loads the player when clicked,
// so pages with several videos stay fast and set no third-party cookies until then.
export function videoEmbed(video, { eager = false } = {}) {
  const aspect = video.aspect || "16/9";
  if (video.youtube) {
    const id = video.youtube;
    return html`<div class="video" style="--ar:${aspect}">
      <a class="video__facade" href="https://www.youtube.com/watch?v=${id}" data-embed="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&amp;rel=0" data-title="${video.title}">
        <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" width="480" height="360" ${raw(eager ? "" : 'loading="lazy"')} decoding="async">
        <span class="video__play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><span>Play <span class="visually-hidden">${video.title}</span></span></span>
      </a>
    </div>`;
  }
  if (video.vimeo) {
    return html`<div class="video" style="--ar:${aspect}">
      <iframe src="https://player.vimeo.com/video/${video.vimeo}?dnt=1" title="${video.title}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>
    </div>`;
  }
  return "";
}

// Bandcamp / SoundCloud / Spotify / anything with an iframe URL.
export function embed(e) {
  return html`<div class="embed" style="height:${e.height || 152}px">
    <iframe src="${e.src}" title="${e.title || e.provider || "Embedded player"}" loading="lazy" allow="autoplay; encrypted-media"></iframe>
  </div>`;
}

const ICON_PLAY = raw('<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>');
const ICON_PAUSE = raw('<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>');

// Real <audio> element (works without JavaScript); JS swaps in the custom UI.
export function audioPlayer(track, { size = "" } = {}) {
  return html`<div class="player ${size}" data-player>
    <audio controls preload="none" src="${url(track.src)}"></audio>
    <div class="player__ui" hidden>
      <button class="player__btn" type="button" aria-label="Play ${track.title}" data-label="${track.title}">${ICON_PLAY}${ICON_PAUSE}</button>
      <input class="player__seek" type="range" min="0" max="1000" step="1" value="0" aria-label="Position in ${track.title}">
      <span class="player__time mono"><span data-cur>0:00</span><span aria-hidden="true"> / </span><span data-dur>–:––</span></span>
    </div>
  </div>`;
}

export { esc };
