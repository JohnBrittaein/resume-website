import { html } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { picture, placeholderFrame, ratioOf, embed } from "../components/media.mjs";
import { card, ctaBand, arrow } from "../components/ui.mjs";

const PRACTICES = [
  { section: "photography", n: "01", label: "Photography" },
  { section: "music", n: "02", label: "Music" },
  { section: "art", n: "03", label: "Art" },
  { section: "video", n: "04", label: "Video" },
  { section: "work", n: "05", label: "Work" },
];

export function homePage(ctx) {
  const { site, about, items, portrait } = ctx;
  const real = items.filter((i) => !i.placeholder);
  const inSection = (s) => real.filter((i) => i.section === s || i.alsoIn.includes(s));
  const shoots = real.filter((i) => i.section === "photography");
  const featured = real.filter((i) => i.featured).slice(0, 5);
  const cats = site.categories.photography;
  const shows = shoots.filter((s) => cats.find((c) => c.slug === s.category)?.group === "shows");
  const releases = real.filter((i) => i.section === "music" && i.category === "releases");
  const latest = releases[0];
  const artSeries = real.filter((i) => i.section === "art");
  const engineering = real.filter((i) => i.section === "work" && i.kind !== "art");
  const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;

  // Look up a photo by [collection slug, file name without extension].
  const pick = ([slug, id]) => {
    const item = real.find((i) => i.slug === slug);
    return item && (item.images.find((im) => im.id === id) || item.cover);
  };
  const t = site.home?.tiles || {};
  const photoPicks = (t.photography || []).map(pick).filter(Boolean);
  const artPick = t.art ? pick(t.art) : artSeries[0]?.cover;
  const workPick = t.work ? pick(t.work) : engineering.find((i) => i.cover)?.cover;

  const label = (name, note) => html`<span class="tile__label"><span class="tile__name">${name} ${arrow}</span><span class="tile__note mono">${note}</span></span>`;

  const body = html`
<section class="hero">
  <div class="wrap">
    <h1 class="hero__name">${site.name}</h1>
    <nav class="hero__roles" aria-label="What I do">
      ${(site.home?.roles || []).map((r, i) => html`${i ? html`<span class="hero__sep" aria-hidden="true">/</span>` : ""}<a href="${url(r.href)}">${r.label}</a>`)}
      <span class="hero__where mono">${site.location}</span>
    </nav>
  </div>
</section>

<section class="mosaic wrap" aria-label="Sections">
  <a class="tile tile--photo" href="${url("/photography/")}">
    <span class="tile__media tile__media--photos">
      ${photoPicks.map((im, i) => html`<span class="tile__img">${picture(im, { sizes: i === 0 ? "(max-width: 800px) 100vw, 45vw" : "(max-width: 800px) 50vw, 22vw", eager: i === 0, alt: im.alt })}</span>`)}
    </span>
    ${label("Photography", `${plural(shows.length, "show")} · ${plural(shoots.length - shows.length, "collection")}`)}
  </a>
  <a class="tile tile--music" href="${url("/music/")}">
    <span class="tile__media tile__media--covers">
      ${releases.slice(0, 4).map((r) => html`<span class="tile__img">${r.cover ? picture(r.cover, { sizes: "(max-width: 800px) 25vw, 12vw", alt: r.cover.alt }) : ""}</span>`)}
    </span>
    ${label("Music", releases.length ? `${plural(releases.length, "single")} on Spotify` : "Music")}
  </a>
  <a class="tile tile--art" href="${url("/art/")}">
    <span class="tile__media">${artPick ? html`<span class="tile__img">${picture(artPick, { sizes: "(max-width: 800px) 50vw, 20vw", alt: artPick.alt })}</span>` : ""}</span>
    ${label("Art", `${plural(artSeries.length, "series", "series")} · collage & 3D`)}
  </a>
  <a class="tile tile--work" href="${url("/work/")}">
    <span class="tile__media">${workPick ? html`<span class="tile__img">${picture(workPick, { sizes: "(max-width: 800px) 50vw, 20vw", alt: workPick.alt })}</span>` : ""}</span>
    ${label("Engineering", plural(engineering.length, "project"))}
  </a>
</section>

<section class="photo-band" data-theme="dark" aria-labelledby="photo-h">
  <div class="wrap"><div class="photo-band__head">
    <h2 id="photo-h" class="section-title">Recent shows</h2>
    <a class="more mono" href="${url("/photography/")}">All photography ${arrow}</a>
  </div></div>
  <div class="wrap-wide photo-band__grid">
    ${shows.length
      ? shows.slice(0, 3).map(
          (s, i) => html`<a class="photo-band__item" href="${url(s.url)}" style="--ar:${ratioOf(s.cover)}">
            ${picture(s.cover, { sizes: i === 0 ? "(max-width: 700px) 100vw, 55vw" : "(max-width: 700px) 100vw, 30vw", alt: s.cover.alt })}
            <span class="photo-band__cap mono">${s.title}${s.dateText ? ` — ${s.dateText}` : ""}</span>
          </a>`
        )
      : site.showPlaceholders
        ? [1.5, 0.8, 1.33].map((r) => html`<div class="photo-band__item photo-band__item--todo" style="--ar:${r}">${placeholderFrame({ label: "[ADD PHOTOGRAPHY PROJECT]", ratio: r })}</div>`)
        : ""}
  </div>
</section>

${latest
  ? html`<section class="latest wrap" aria-labelledby="latest-h">
  <div class="section-head">
    <h2 id="latest-h" class="section-title">Latest release</h2>
    <a class="more mono" href="${url("/music/")}">All music ${arrow}</a>
  </div>
  <div class="latest__body">
    <a class="latest__cover" href="${url(latest.url)}">${latest.cover ? picture(latest.cover, { sizes: "(max-width: 700px) 40vw, 200px", alt: latest.cover.alt }) : ""}</a>
    <div class="latest__info">
      <a class="latest__title" href="${url(latest.url)}">${latest.title}</a>
      <p class="mono latest__date">${[latest.subtitle, latest.dateText].filter(Boolean).join(" · ")}</p>
      ${latest.embeds[0] ? embed(latest.embeds[0]) : ""}
    </div>
  </div>
</section>`
  : ""}

${featured.length
  ? html`<section class="recent wrap" aria-labelledby="recent-h">
  <div class="section-head">
    <h2 id="recent-h" class="section-title">Selected work</h2>
  </div>
  <div class="recent__grid">
    ${featured.map((i, n) => card(i, { sizes: n === 0 ? "(max-width: 700px) 100vw, 58vw" : "(max-width: 700px) 100vw, 30vw" }))}
  </div>
</section>`
  : ""}

<section class="about-teaser wrap" aria-labelledby="about-h">
  <div class="about-teaser__img">${portrait ? picture(portrait, { sizes: "(max-width: 700px) 60vw, 320px", alt: "Portrait of John Brittain" }) : placeholderFrame({ label: "Portrait coming soon", ratio: 0.8 })}</div>
  <div class="about-teaser__text">
    <h2 id="about-h" class="section-title">About</h2>
    <p>${about.short}</p>
    <p class="about-teaser__links"><a class="more mono" href="${url("/about/")}">More about me ${arrow}</a> <a class="more mono" href="${url(site.resume)}" target="_blank" rel="noopener">Résumé (PDF) ↗</a></p>
  </div>
</section>

${ctaBand({
  title: "Contact",
  actions: [
    { label: "Book photography", href: "/contact/photography/" },
    { label: "Get in touch", href: "/contact/" },
  ],
})}`;

  return {
    path: "/",
    section: "home",
    theme: "crt",
    body,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      url: ctx.absUrl("/"),
      email: `mailto:${site.email}`,
      address: { "@type": "PostalAddress", addressLocality: site.location.split(",")[0].trim(), addressRegion: "IA", addressCountry: "US" },
      sameAs: site.socials.filter((s) => s.url).map((s) => s.url),
      knowsAbout: ["Photography", "Music", "Sound design", "Computer engineering", "Embedded systems", "Lab automation"],
    },
  };
}
