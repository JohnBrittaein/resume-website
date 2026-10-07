import { html } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { md } from "../../scripts/lib/html.mjs";
import { picture, placeholderFrame, ratioOf, gallery } from "../components/media.mjs";
import { pageHead, breadcrumbs, filters, ctaBand, prevNext, linkList, credits, arrow, badge } from "../components/ui.mjs";

// Photography category -> the matching option in the inquiry form.
const INQUIRY_TYPE = { concerts: "Concert", skate: "Skate", events: "Event", portraits: "Portrait", street: "Editorial" };

export function photographyIndex(ctx) {
  const { site, items } = ctx;
  const cats = site.categories.photography;
  const groupOf = (slug) => cats.find((c) => c.slug === slug)?.group || "collections";
  const shoots = items.filter((i) => i.section === "photography" && !i.placeholder);
  const shows = shoots.filter((s) => groupOf(s.category) === "shows");
  // Collections follow the category order in content/site.js.
  const collections = shoots
    .filter((s) => groupOf(s.category) !== "shows")
    .sort((a, b) => cats.findIndex((c) => c.slug === a.category) - cats.findIndex((c) => c.slug === b.category) || a.title.localeCompare(b.title));
  let n = 0;

  const card = (s) => html`<a class="pcard" href="${url(s.url)}" data-cat="${s.category}">
      <span class="pcard__media">${s.cover ? picture(s.cover, { sizes: "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw", eager: n++ < 3, alt: "" }) : placeholderFrame({ label: "[ADD PHOTOS]" })}</span>
      <span class="pcard__meta mono"><span>${s.categoryLabel}</span><span>${s.images.length} photos</span></span>
      <span class="pcard__title">${s.title} ${badge(s)}</span>
      <span class="pcard__sub mono">${[s.dateText, s.location].filter(Boolean).join(" · ")}</span>
    </a>`;

  const section = (id, title, list) =>
    list.length
      ? html`<h2 class="pgroup__h section-title" id="${id}" data-cat="${[...new Set(list.map((s) => s.category))].join(" ")}">${title}</h2>
        <div class="pgrid">${list.map(card)}</div>`
      : "";

  const body = html`
${pageHead({
  title: "Photography",
  children: html`<p class="page-head__cta"><a class="btn" href="${url("/contact/photography/")}">Book / inquire ${arrow}</a></p>`,
})}
<div class="wrap">${filters(cats, shoots, { target: "shoots" })}</div>
<div class="wrap pgroups" id="shoots" data-filterable>
  ${section("shows-h", "Shows & Events", shows)}
  ${section("collections-h", "Collections", collections)}
  ${site.showPlaceholders && !shoots.length ? placeholderFrame({ label: "[ADD PHOTOGRAPHY PROJECT]", note: "See docs/CONTENT.md → Photography" }) : ""}
  <p class="filter-empty mono" hidden>Nothing in this category yet.</p>
</div>
${ctaBand({
  title: "Book a shoot",
  actions: [{ label: "Book / inquire", href: "/contact/photography/" }],
  theme: "cta--quiet",
})}`;

  return {
    path: "/photography/",
    section: "photography",
    theme: "dark",
    title: "Photography",
    description: `Concert, skate, and event photography, plus street, portrait, and landscape collections by ${site.name}.`,
    og: (shows[0] || collections[0])?.og,
    body,
  };
}

export function photographyProject(ctx, item) {
  const { site, items } = ctx;
  const shoots = items.filter((i) => i.section === "photography");
  const type = INQUIRY_TYPE[item.category] || "";
  const meta = [item.dateText, item.location, item.categoryLabel].filter(Boolean);

  const body = html`
<article class="shoot-page">
  <header class="shoot-page__head wrap">
    ${breadcrumbs([{ label: "Photography", href: "/photography/" }, ...(item.categoryLabel ? [{ label: item.categoryLabel, href: `/photography/#${item.category}` }] : []), { label: item.title }])}
    <h1 class="page-title">${item.title}</h1>
    ${item.draft ? html`<p class="item__sub mono">${badge(item)} Only visible in your local preview until you remove <code>draft: true</code>.</p>` : ""}
    ${meta.length ? html`<p class="shoot-page__meta mono">${meta.map((m) => html`<span>${m}</span>`)}</p>` : ""}
    <div class="shoot-page__intro">
      <div class="prose">${md(item.description, { placeholders: site.showPlaceholders })}</div>
      <div class="shoot-page__side">${credits(item)}${linkList(item)}</div>
    </div>
  </header>
  <div class="wrap-wide">
    ${item.images.length
      ? gallery(item.images, { group: item.slug, row: 560, variant: "justify--photos", captions: true, hero: true })
      : site.showPlaceholders
        ? html`<div class="justify justify--photos" style="--row:420px">${[1.5, 0.67, 1.5, 1.5, 0.8, 1.33].map((r) => html`<div class="justify__item" style="--ar:${r}">${placeholderFrame({ label: "[ADD PHOTO]", ratio: r })}</div>`)}</div>`
        : ""}
    <p class="shoot-page__count mono">${item.images.length ? `${item.images.length} photographs` : ""}</p>
    <p class="shoot-page__optout">In one of these photos and want it taken down? <a href="mailto:${site.email}?subject=${encodeURIComponent(`Photo removal request: ${item.title}`)}">Email me</a>.</p>
  </div>
</article>
${item.inquire !== false
  ? ctaBand({
      title: "Book a shoot",
      actions: [
        { label: "Book / inquire", href: `/contact/photography/${type ? `?type=${type}` : ""}` },
        { label: "More photography", href: "/photography/" },
      ],
      theme: "cta--quiet",
    })
  : ""}
${prevNext(shoots, item)}`;

  return {
    path: item.url,
    section: "photography",
    theme: "dark",
    title: item.title,
    description: item.summary || `${item.title}: ${[item.categoryLabel, item.dateText, item.location].filter(Boolean).join(", ")}. Photography by ${site.name}.`,
    og: item.og,
    ogType: "article",
    body,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: item.title,
      dateCreated: item.date?.iso,
      locationCreated: item.location,
      creator: { "@type": "Person", name: site.name },
      url: ctx.absUrl(item.url),
    },
  };
}
