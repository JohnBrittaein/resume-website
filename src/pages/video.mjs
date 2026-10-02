import { html, md } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { videoEmbed, placeholderFrame } from "../components/media.mjs";
import { pageHead, breadcrumbs, specList, linkList, credits, prevNext, KIND_LABEL, arrow } from "../components/ui.mjs";

// Everything with a video: entries in content/video plus demos attached to
// music and engineering projects (they link back to their project page).
function videoList(items) {
  return items
    .filter((i) => (i.section === "video" || i.video) && (i.video || i.placeholder))
    .map((i) => ({ item: i, category: i.section === "video" ? i.category : "demos" }));
}

function tile({ item }) {
  if (item.placeholder) {
    return html`<figure class="vtile vtile--todo" style="--ar:1.7778">${placeholderFrame({ label: item.title, ratio: 16 / 9 })}</figure>`;
  }
  const [w, h] = item.video.aspect.split("/").map(Number);
  const demo = item.section !== "video";
  return html`<figure class="vtile" style="--ar:${(w / h).toFixed(4)}" data-cat="${demo ? "demos" : item.category}">
    ${videoEmbed(item.video)}
    <figcaption>
      <span class="vtile__meta mono">${demo ? `${KIND_LABEL[item.kind]} demo` : item.categoryLabel}${item.year ? ` · ${item.year}` : ""}</span>
      <a class="vtile__title" href="${url(item.url)}">${item.title} ${arrow}</a>
    </figcaption>
  </figure>`;
}

export function videoIndex(ctx) {
  const { site, items } = ctx;
  const list = videoList(items);
  const groups = site.categories.video.map((c) => ({ ...c, list: list.filter((v) => v.category === c.slug) })).filter((g) => g.list.length);

  const body = html`
${pageHead({
  title: "Video",
})}
<div class="wrap-wide video-page">
  ${groups.map(
    (g) => html`<section class="video-group" aria-labelledby="v-${g.slug}">
      <h2 class="video-group__h mono" id="v-${g.slug}">${g.label}</h2>
      <div class="vgrid">${g.list.map(tile)}</div>
    </section>`
  )}
</div>`;

  return {
    path: "/video/",
    section: "video",
    theme: "dark",
    title: "Video",
    description: `Animation, music video, and demo work by ${site.name}.`,
    body,
  };
}

export function videoItem(ctx, item) {
  const { site, items } = ctx;
  const own = items.filter((i) => i.section === "video");
  const body = html`
<article class="item wrap">
  ${breadcrumbs([{ label: "Video", href: "/video/" }, ...(item.categoryLabel ? [{ label: item.categoryLabel, href: "/video/" }] : []), { label: item.title }])}
  <h1 class="page-title page-title--item">${item.title}</h1>
  ${item.subtitle ? html`<p class="lede">${item.subtitle}</p>` : ""}
  <div class="item__stage">${item.video ? videoEmbed(item.video, { eager: true }) : ""}</div>
  <div class="item__grid">
    <div class="item__main prose">${md(item.description, { placeholders: site.showPlaceholders })}</div>
    <aside class="item__aside">
      ${specList([
        ["Category", item.categoryLabel],
        ["Year", item.year],
        ["Role", item.role],
        ["Tools", item.tools],
      ])}
      ${credits(item)}
      ${linkList(item)}
    </aside>
  </div>
</article>
${prevNext(own, item)}`;

  return {
    path: item.url,
    section: "video",
    theme: "dark",
    title: item.title,
    description: item.summary || `${item.title}${item.subtitle ? `, ${item.subtitle.toLowerCase()}` : ""} by ${site.name}.`,
    og: item.og,
    ogType: "video.other",
    body,
  };
}
