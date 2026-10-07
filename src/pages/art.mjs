import { html, md } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { gallery } from "../components/media.mjs";
import { pageHead, breadcrumbs, linkList, credits, prevNext, arrow, badge } from "../components/ui.mjs";

// How many pieces of each series to show on the /art/ overview.
const PREVIEW = 9;

export function artIndex(ctx) {
  const { site, items } = ctx;
  const series = items.filter((i) => i.section === "art" && !i.placeholder).sort((a, b) => a.order - b.order);

  const body = html`
${pageHead({
  title: "Art",
})}
<div class="wrap art-page">
  ${series.map(
    (s) => html`<section class="art-series" aria-labelledby="a-${s.slug}">
      <div class="section-head">
        <h2 id="a-${s.slug}" class="section-title"><a href="${url(s.url)}">${s.title}</a> ${badge(s)}</h2>
        <p class="section-note mono">${[s.categoryLabel, `${s.images.length} pieces`, s.year].filter(Boolean).join(" · ")}</p>
      </div>
      ${s.lede ? html`<p class="art-series__lede">${s.lede}</p>` : ""}
      ${gallery(s.images.slice(0, PREVIEW), { group: s.slug, row: 300, captions: true })}
      <p class="art-series__more"><a class="more mono" href="${url(s.url)}">${s.images.length > PREVIEW ? `All ${s.images.length} pieces` : "View the series"} ${arrow}</a></p>
    </section>`
  )}
</div>`;

  return {
    path: "/art/",
    section: "art",
    theme: "art",
    title: "Art",
    description: `Photo collages, 3D renders, and visual art by ${site.name}.`,
    og: series[0]?.og,
    body,
  };
}

export function artItem(ctx, item) {
  const { site, items } = ctx;
  const series = items.filter((i) => i.section === "art").sort((a, b) => a.order - b.order);

  const body = html`
<article class="item wrap">
  ${breadcrumbs([{ label: "Art", href: "/art/" }, { label: item.title }])}
  <h1 class="page-title page-title--item">${item.title}</h1>
  ${item.subtitle || item.inProgress ? html`<p class="item__sub mono">${item.subtitle || ""} ${badge(item)}</p>` : ""}
  ${item.lede ? html`<p class="lede">${item.lede}</p>` : ""}
  <div class="art-item__intro">
    <div class="prose item__intro">${md(item.description, { placeholders: site.showPlaceholders })}</div>
    <div>${credits(item)}${linkList(item)}</div>
  </div>
</article>
<div class="wrap-wide item__gallery">${gallery(item.images, { group: item.slug, row: 460, captions: true })}</div>
${prevNext(series, item)}`;

  return {
    path: item.url,
    section: "art",
    theme: "art",
    title: item.title,
    description: item.summary || `${item.title}: ${item.images.length} pieces by ${site.name}.`,
    og: item.og,
    ogType: "article",
    body,
  };
}
