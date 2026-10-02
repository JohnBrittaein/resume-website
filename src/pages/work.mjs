import { html, md, isTodo, linkAttrs } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { picture, zoomable, gallery, videoEmbed, ratioOf } from "../components/media.mjs";
import { pageHead, breadcrumbs, filters, workRow, specList, linkList, credits, prevNext, arrow, extArrow, badge } from "../components/ui.mjs";

// Engineering entries, plus items from other sections cross-listed with alsoIn: ["work"].
export function engineeringItems(items, site) {
  const cats = site.categories.work;
  const list = items
    .filter((i) => (i.section === "work" && i.kind !== "art") || (i.section !== "work" && i.alsoIn.includes("work")))
    .map((i) => {
      if (i.section === "work") return i;
      const category = i.workCategory || i.category;
      return { ...i, category, categoryLabel: cats.find((c) => c.slug === category)?.label || "" };
    });
  return [...list.filter((i) => !i.placeholder), ...list.filter((i) => i.placeholder)];
}

export function workIndex(ctx) {
  const { site, about, items } = ctx;
  const eng = engineeringItems(items, site);

  const body = html`
${pageHead({
  title: "Work",
  children: html`<p class="page-head__cta"><a class="btn" href="${url(site.resume)}" target="_blank" rel="noopener">Résumé (PDF) ${extArrow}</a></p>`,
})}
<section class="wrap" aria-labelledby="eng-h">
  <h2 id="eng-h" class="visually-hidden">Engineering projects</h2>
  ${filters(site.categories.work, eng.filter((i) => !i.placeholder), { target: "eng-list" })}
  <ol class="work-list" id="eng-list" data-filterable>
    ${eng.map((i, n) => workRow(i, n + 1))}
    <li class="filter-empty mono" hidden>Nothing in this category yet.</li>
  </ol>
</section>

<section class="wrap writing" aria-labelledby="writing-h">
  <div class="section-head">
    <h2 id="writing-h" class="section-title">Writing &amp; research</h2>
  </div>
  <ul class="writing__list">
    ${about.writing.map(
      (w) => html`<li><a class="writing__item" ${linkAttrs(w.file)}>
        <span class="writing__kind mono">${w.kind} · PDF</span>
        <span class="writing__title">${w.title} ${extArrow}</span>
        <span class="writing__summary">${w.summary}</span>
      </a></li>`
    )}
  </ul>
</section>`;

  return {
    path: "/work/",
    section: "work",
    theme: "work",
    title: "Work",
    description: `Engineering, software, and research by ${site.name}: lab automation, robotics, FPGA and CPU design, audio tools, and machine learning.`,
    body,
  };
}

const section = (title, content) => (content && !isTodo(content) ? html`<section class="item__section"><h2 class="item__h mono">${title}</h2>${content}</section>` : "");

export function workItem(ctx, item) {
  const { site, items } = ctx;
  const isArt = item.kind === "art";
  const siblings = items.filter((i) => i.section === "work");
  const cat = item.categoryLabel;
  const lead = isArt ? null : item.images[0];
  const rest = isArt ? item.images : item.images.slice(1);
  const details = Array.isArray(item.details)
    ? html`<ul class="bullets">${item.details.map((d) => html`<li>${d}</li>`)}</ul>`
    : item.details
      ? md(item.details)
      : "";

  const body = html`
<article class="item wrap">
  ${breadcrumbs([{ label: "Work", href: "/work/" }, ...(cat ? [{ label: cat, href: isArt ? "/work/" : `/work/#${item.category}` }] : []), { label: item.title }])}
  <h1 class="page-title page-title--item">${item.title}</h1>
  ${item.subtitle || item.inProgress ? html`<p class="item__sub mono">${item.subtitle || ""} ${badge(item)}</p>` : ""}
  ${item.lede ? html`<p class="lede">${item.lede}</p>` : ""}

  ${isArt
    ? html`<div class="prose item__intro">${md(item.description, { placeholders: site.showPlaceholders })}</div>`
    : html`<div class="item__grid">
    <div class="item__main">
      ${item.video ? html`<div class="item__stage${item.video.aspect === "9/16" ? " item__stage--tall" : ""}">${videoEmbed(item.video)}</div>` : ""}
      ${lead ? html`<figure class="item__figure">${zoomable(lead, { group: item.slug, sizes: "(max-width: 900px) 100vw, 62vw" })}${lead.caption ? html`<figcaption class="mono">${lead.caption}</figcaption>` : ""}</figure>` : ""}
      ${section("Overview", md(item.description, { placeholders: site.showPlaceholders }))}
      ${item.problem ? section("Problem", md(item.problem)) : ""}
      ${item.solution ? section("Solution", md(item.solution)) : ""}
      ${item.results ? section("Results", md(item.results)) : ""}
      ${details ? section("Technical details", details) : ""}
    </div>
    <aside class="item__aside">
      ${specList([
        ["Category", cat],
        ["Year", item.year],
        ["Role", item.role],
        ["Tools", item.tools],
        ["Skills", item.skills],
        ["Tags", item.tags],
      ])}
      ${credits(item)}
      ${linkList(item)}
    </aside>
  </div>`}
</article>
${rest.length ? html`<div class="wrap-wide item__gallery">${gallery(rest, { group: item.slug, row: isArt ? 360 : 300 })}</div>` : ""}
${prevNext(siblings, item)}`;

  return {
    path: item.url,
    section: "work",
    theme: "work",
    title: item.title,
    description: item.summary || `${item.title}, ${cat.toLowerCase()} work by ${site.name}.`,
    og: item.og,
    ogType: "article",
    body,
  };
}
