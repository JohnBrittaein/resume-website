import { html, md, mdInline, linkAttrs } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { picture, placeholderFrame } from "../components/media.mjs";
import { extArrow } from "../components/ui.mjs";

export function aboutPage(ctx) {
  const { site, about, portrait } = ctx;

  const body = html`
<section class="about-hero wrap">
  <div class="about-hero__text">
    <h1 class="page-title about-hero__title">About</h1>
    <div class="prose prose--lg">${md(about.intro)}</div>
  </div>
  <figure class="about-hero__img">
    ${portrait ? picture(portrait, { sizes: "(max-width: 800px) 100vw, 38vw", eager: true, alt: "Portrait of John Brittain" }) : placeholderFrame({ label: "Portrait coming soon", ratio: 0.8 })}
  </figure>
</section>

<section class="background wrap" aria-labelledby="bg-h">
  <div class="section-head">
    <h2 id="bg-h" class="section-title">Background</h2>
    <a class="btn btn--solid" href="${url(site.resume)}" target="_blank" rel="noopener">Download résumé (PDF) ${extArrow}</a>
  </div>

  <div class="background__grid">
    <div class="background__block">
      <h3 class="background__h mono">Education</h3>
      ${about.education.map(
        (e) => html`<div class="entry">
          <p class="entry__title"><a ${linkAttrs(e.url)}>${e.school}</a>, ${e.place}</p>
          <p>${e.degree}</p>
          ${e.notes.map((n) => html`<p class="entry__note mono">${n}</p>`)}
        </div>`
      )}
    </div>

    <div class="background__block background__block--wide">
      <h3 class="background__h mono">Experience &amp; research</h3>
      ${about.experience.map(
        (x) => html`<div class="entry">
          <p class="entry__title"><a ${linkAttrs(x.url)}>${x.org}</a></p>
          ${x.roles.map((r) => html`<p class="entry__role">${r.title} <span class="entry__note mono">${r.dates}</span></p>`)}
          <ul class="bullets">${x.points.map((p) => html`<li>${mdInline(p)}</li>`)}</ul>
        </div>`
      )}
      <div class="entry">
        <p class="entry__title"><a href="${url("/work/cyflybot/")}">CYFLYBOT</a>, Iowa State senior design (sddec26-11)</p>
        <p>A coordinated aerial-ground autonomous robotic system for warehouse applications, developed as a research proof of concept for multi-agent autonomy.</p>
      </div>
    </div>

    <div class="background__block">
      <h3 class="background__h mono">Skills</h3>
      ${about.skills.map(
        (s) => html`<div class="entry">
          <p class="entry__note mono">${s.label}</p>
          <ul class="tags">${s.items.map((t) =>
            typeof t === "string" ? html`<li><span class="tag">${t}</span></li>` : html`<li><a class="tag tag--link" href="${url(t.href)}">${t.label}</a></li>`
          )}</ul>
        </div>`
      )}
    </div>

    <div class="background__block">
      <h3 class="background__h mono">Writing</h3>
      <ul class="plain-list">
        ${about.writing.map((w) => html`<li><a ${linkAttrs(w.file)}>${w.title}</a> <span class="entry__note mono">${w.kind}</span></li>`)}
      </ul>
    </div>
  </div>
</section>

`;

  return {
    path: "/about/",
    section: "about",
    theme: "crt",
    title: "About",
    description: `${site.name} makes photographs, music, and machines. Background, education, experience, and résumé.`,
    og: ctx.portraitOg,
    body,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: site.name,
        alumniOf: about.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
        sameAs: site.socials.filter((s) => s.url).map((s) => s.url),
      },
    },
  };
}
