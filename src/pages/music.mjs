import { html, md, isTodo } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { audioPlayer, videoEmbed, embed, picture, zoomable } from "../components/media.mjs";
import { pageHead, breadcrumbs, specList, linkList, credits, prevNext, arrow } from "../components/ui.mjs";

// Items that live in Music, plus Work items cross-listed with alsoIn: ["music"].
export function musicItems(items) {
  return items
    .filter((i) => i.section === "music" || i.alsoIn.includes("music"))
    .map((i) => (i.section === "music" ? i : { ...i, musicCategory: i.musicCategory || "instruments" }));
}

function track(item, n, site) {
  const cat = item.musicCategory || item.category;
  if (item.placeholder) {
    return html`<li class="track track--todo" data-cat="${cat}">
      <span class="track__n mono">${String(n).padStart(2, "0")}</span>
      <span class="track__main"><span class="track__title">${item.title}</span> <span class="todo-tag mono">[ADD PROJECT DETAILS]</span></span>
    </li>`;
  }
  const a = item.audio[0];
  return html`<li class="track" data-cat="${cat}">
    <span class="track__n mono">${String(n).padStart(2, "0")}</span>
    <span class="track__main">
      <a class="track__title" href="${url(item.url)}">${item.title}</a>
      ${item.summary ? html`<span class="track__sub">${item.summary}</span>` : ""}
    </span>
    <span class="track__play">
      ${a
        ? audioPlayer(a)
        : item.video
          ? html`<a class="more mono" href="${url(item.url)}">Watch the demo ${arrow}</a>`
          : html`<a class="more mono" href="${url(item.url)}">Details ${arrow}</a>`}
    </span>
  </li>`;
}

// A release card: cover art, title, date, compact Spotify player, streaming link.
function release(item) {
  const sp = item.embeds.find((e) => /spotify/i.test(e.provider || e.src));
  const all = item.links.find((l) => /all platforms/i.test(l.label));
  return html`<li class="release">
    <a class="release__cover" href="${url(item.url)}">${item.cover ? picture(item.cover, { sizes: "(max-width: 640px) 100vw, 25vw", alt: item.cover.alt }) : ""}</a>
    <a class="release__title" href="${url(item.url)}">${item.title}</a>
    <span class="release__meta mono">${[item.subtitle, item.dateText].filter(Boolean).join(" · ")}</span>
    ${sp ? embed({ ...sp, height: 80 }) : ""}
    ${all ? html`<a class="more mono" href="${all.url}" target="_blank" rel="noopener noreferrer">Listen everywhere ↗</a>` : ""}
  </li>`;
}

export function musicIndex(ctx) {
  const { site, items } = ctx;
  const all = musicItems(items);
  const groups = site.categories.music
    .map((c) => ({ ...c, list: all.filter((i) => (i.musicCategory || i.category) === c.slug) }))
    .filter((g) => g.list.length);
  const artist = site.socials.find((s) => s.label === "Spotify" && s.url);
  let n = 0;

  const body = html`
${pageHead({
  title: "Music",
})}
${ctx.musicBanner ? html`<figure class="music-banner">${picture(ctx.musicBanner, { sizes: "100vw", alt: "" })}</figure>` : ""}
<div class="wrap music">
  ${site.showPlaceholders && !site.socials.find((s) => /bandcamp|soundcloud|spotify/i.test(s.label) && s.url)
    ? html`<p class="todo-line mono">[ADD BANDCAMP / SOUNDCLOUD / SPOTIFY LINKS OR EMBEDS]</p>`
    : ""}
  ${groups.map(
    (g) => html`<section class="music__group" aria-labelledby="m-${g.slug}">
      <h2 class="music__h" id="m-${g.slug}"><span class="mono">${g.label}</span>${g.slug === "releases" && artist ? html` <a class="more mono music__artist" href="${artist.url}" target="_blank" rel="noopener noreferrer">Spotify artist page ↗</a>` : ""}</h2>
      ${g.slug === "releases" ? html`<ul class="releases">${g.list.map(release)}</ul>` : html`<ol class="tracks">${g.list.map((i) => track(i, ++n, site))}</ol>`}
    </section>`
  )}
</div>`;

  return {
    path: "/music/",
    section: "music",
    theme: "music",
    title: "Music",
    description: `Composition, sound design, instruments, and audio experiments by ${site.name}.`,
    body,
  };
}

export function musicItem(ctx, item) {
  const { site, items } = ctx;
  const all = musicItems(items).filter((i) => i.section === "music");
  const body = html`
<article class="item wrap">
  ${breadcrumbs([{ label: "Music", href: "/music/" }, ...(item.categoryLabel ? [{ label: item.categoryLabel, href: "/music/" }] : []), { label: item.title }])}
  <h1 class="page-title page-title--item">${item.title}</h1>
  ${item.subtitle ? html`<p class="item__sub mono">${item.subtitle}</p>` : ""}
  ${item.lede ? html`<p class="lede">${item.lede}</p>` : ""}
  <div class="item__grid">
    <div class="item__main">
      ${item.audio.map((a) => audioPlayer(a, { size: "player--big" }))}
      ${item.video ? videoEmbed(item.video) : ""}
      ${item.embeds.map(embed)}
      ${item.cover && !item.video ? html`<figure class="item__figure item__figure--cover">${zoomable(item.cover, { group: item.slug, sizes: "(max-width: 900px) 100vw, 60vw" })}</figure>` : ""}
      <div class="prose">${md(item.description, { placeholders: site.showPlaceholders })}</div>
    </div>
    <aside class="item__aside">
      ${specList([
        ["Category", item.categoryLabel],
        ["Year", item.year],
        ["Role", item.role],
        ["Tools", item.tools],
        ["Skills", item.skills],
      ])}
      ${credits(item)}
      ${linkList(item)}
    </aside>
  </div>
</article>
${prevNext(all, item)}`;

  return {
    path: item.url,
    section: "music",
    theme: "music",
    title: item.title,
    description: item.summary || `${item.title}, ${item.categoryLabel.toLowerCase()} by ${site.name}.`,
    og: item.og,
    ogType: item.audio.length ? "music.song" : "article",
    body,
  };
}

export { isTodo, picture };
