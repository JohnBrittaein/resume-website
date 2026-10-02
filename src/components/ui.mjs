// Shared page furniture.
import { html, raw, linkAttrs, isTodo } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { picture, placeholderFrame, ratioOf } from "./media.mjs";

export const KIND_LABEL = {
  photography: "Photography",
  music: "Music",
  video: "Video",
  engineering: "Engineering",
  art: "Art",
  collage: "Art",
};

export const typeLabel = (item) => [KIND_LABEL[item.kind], item.categoryLabel].filter(Boolean).join(" · ");

export const badge = (item) =>
  html`${item.draft ? html`<span class="badge badge--draft mono">Draft</span>` : ""}${item.inProgress ? html`<span class="badge mono">In progress</span>` : ""}`;

export const arrow = raw('<span class="arrow" aria-hidden="true">→</span>');
export const extArrow = raw('<span class="arrow" aria-hidden="true">↗</span>');

export function pageHead({ number, section, title, lede, children = "" }) {
  return html`<header class="page-head wrap">
    ${section ? html`<p class="eyebrow">${number ? html`<span class="eyebrow__n">${number}</span>` : ""}${section}</p>` : ""}
    <h1 class="page-title">${title}</h1>
    ${lede ? html`<p class="lede">${lede}</p>` : ""}
    ${children}
  </header>`;
}

export function breadcrumbs(trail) {
  return html`<nav class="crumbs mono" aria-label="Breadcrumb"><ol>
    ${trail.map((t, i) =>
      i === trail.length - 1 ? html`<li aria-current="page">${t.label}</li>` : html`<li><a href="${url(t.href)}">${t.label}</a></li>`
    )}
  </ol></nav>`;
}

// Category filter. Works as plain in-page anchors without JavaScript; with JS
// it hides non-matching items and keeps the choice in the URL hash.
export function filters(cats, items, { target, allLabel = "All" }) {
  const counts = (slug) => items.filter((i) => i.category === slug || i.filterCats?.includes(slug)).length;
  const present = cats.filter((c) => counts(c.slug) > 0);
  if (present.length < 2) return "";
  return html`<div class="filters" data-filters="${target}" role="group" aria-label="Filter by category">
    <button type="button" class="filter" aria-pressed="true" data-filter="all">${allLabel} <span class="filter__n">${items.length}</span></button>
    ${present.map(
      (c) => html`<button type="button" class="filter" aria-pressed="false" data-filter="${c.slug}">${c.label} <span class="filter__n">${counts(c.slug)}</span></button>`
    )}
  </div>`;
}

export function specList(rows) {
  const filled = rows.filter(([, v]) => v && (!Array.isArray(v) || v.length) && !isTodo(v));
  if (!filled.length) return "";
  return html`<dl class="spec">
    ${filled.map(([k, v]) => html`<div class="spec__row"><dt>${k}</dt><dd>${Array.isArray(v) ? v.join(", ") : v}</dd></div>`)}
  </dl>`;
}

export function linkList(item) {
  const links = [
    ...item.links.filter((l) => l.url).map((l) => ({ label: l.label, href: l.url })),
    ...item.documents.map((d) => ({ label: d.label, href: d.file, doc: true })),
  ];
  if (!links.length) return "";
  return html`<ul class="links">
    ${links.map(
      (l) => html`<li><a ${linkAttrs(l.href)}>${l.doc ? html`<span class="links__tag mono">PDF</span>` : ""}${l.label} ${l.doc || /^https?:/.test(l.href) ? extArrow : arrow}</a></li>`
    )}
  </ul>`;
}

export function credits(item) {
  const rows = [...item.credits.map((c) => [c.role, c.name]), ...item.collaborators.map((c) => [c.role || "With", c.name])];
  return rows.length ? specList(rows) : "";
}

// A row in the engineering index: thumbnail, title, category, year.
export function workRow(item, n) {
  if (item.placeholder) {
    return html`<li class="work-row work-row--todo" data-cat="${item.category}">
      <span class="work-row__n mono">${String(n).padStart(2, "0")}</span>
      <span class="work-row__thumb">${placeholderFrame({ label: "[ADD]", ratio: 4 / 3 })}</span>
      <span class="work-row__title">${item.title} <span class="todo-tag mono">[ADD PROJECT DETAILS]</span></span>
      <span class="work-row__cat mono">${item.categoryLabel}</span>
      <span class="work-row__year mono"></span>
    </li>`;
  }
  return html`<li class="work-row" data-cat="${[item.category, ...(item.filterCats || [])].join(" ")}">
    <a class="work-row__link" href="${url(item.url)}">
      <span class="work-row__n mono">${String(n).padStart(2, "0")}</span>
      <span class="work-row__thumb">${item.cover
        ? picture(item.cover, { sizes: "160px", alt: "" })
        : item.video?.youtube
          ? html`<img src="https://i.ytimg.com/vi/${item.video.youtube}/mqdefault.jpg" alt="" loading="lazy" width="320" height="180">`
          : html`<span class="work-row__glyph mono" aria-hidden="true">${item.title.slice(0, 2)}</span>`}</span>
      <span class="work-row__title">${item.title}${item.subtitle ? html` <span class="work-row__sub">${item.subtitle}</span>` : ""} ${badge(item)}
        ${item.summary ? html`<span class="work-row__summary">${item.summary}</span>` : ""}</span>
      <span class="work-row__cat mono">${item.categoryLabel}</span>
      <span class="work-row__year mono">${item.year}</span>
    </a>
  </li>`;
}

// Card used in mixed feeds (homepage, related work).
export function card(item, { sizes = "(max-width: 700px) 100vw, 33vw", ratio } = {}) {
  const img = item.cover
    ? picture(item.cover, { sizes, alt: "" })
    : item.video?.youtube
      ? html`<img src="https://i.ytimg.com/vi/${item.video.youtube}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">`
      : html`<span class="card__glyph" aria-hidden="true">${item.kind === "music" ? "♪" : item.title.slice(0, 1)}</span>`;
  return html`<a class="card card--${item.kind}" href="${url(item.url)}" style="${ratio ? `--ar:${ratio}` : ""}">
    <span class="card__media">${img}</span>
    <span class="card__meta mono">${typeLabel(item)}${item.year ? html` <span class="card__year">${item.year}</span>` : ""}</span>
    <span class="card__title">${item.title} ${badge(item)}</span>
  </a>`;
}

export function ctaBand({ title, text, actions, theme = "" }) {
  return html`<section class="cta ${theme}" aria-label="${title}">
    <div class="wrap"><div class="cta__inner">
      <h2 class="cta__title">${title}</h2>
      ${text ? html`<p class="cta__text">${text}</p>` : ""}
      <div class="cta__actions">
        ${actions.map((a, i) => html`<a class="btn${i === 0 ? " btn--solid" : ""}" href="${url(a.href)}">${a.label} ${arrow}</a>`)}
      </div>
    </div></div>
  </section>`;
}

export function prevNext(list, item) {
  const pages = list.filter((i) => i.hasPage);
  const i = pages.indexOf(item);
  if (i < 0 || pages.length < 2) return "";
  const prev = pages[(i - 1 + pages.length) % pages.length];
  const next = pages[(i + 1) % pages.length];
  return html`<div class="wrap pager-wrap"><nav class="pager" aria-label="More projects">
    <a class="pager__link" href="${url(prev.url)}" rel="prev"><span class="mono">← Previous</span><span class="pager__title">${prev.title}</span></a>
    <a class="pager__link pager__link--next" href="${url(next.url)}" rel="next"><span class="mono">Next →</span><span class="pager__title">${next.title}</span></a>
  </nav></div>`;
}

export { ratioOf };
