import { html } from "../../scripts/lib/html.mjs";
import { url } from "../../scripts/lib/paths.mjs";
import { pageHead, breadcrumbs, arrow, extArrow } from "../components/ui.mjs";
import { contactForm, photoInquiryForm } from "../components/forms.mjs";

export function contactPage(ctx) {
  const { site } = ctx;
  const socials = site.socials.filter((s) => s.url);

  const body = html`
${pageHead({
  title: "Contact",
})}
<div class="wrap contact">
  <div class="contact__side">
    <p class="eyebrow">Email</p>
    <a class="contact__mail" href="mailto:${site.email}">${site.email}</a>
    ${socials.length
      ? html`<p class="eyebrow">Elsewhere</p>
    <ul class="plain-list contact__socials">${socials.map((s) => html`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ${extArrow}</a></li>`)}</ul>`
      : ""}
    ${site.showPlaceholders && !site.socials.find((s) => s.label === "Instagram")?.url ? html`<p class="todo-line mono">[ADD INSTAGRAM]</p>` : ""}
    <p class="eyebrow">Based in</p>
    <p>${site.location}</p>
    <p class="eyebrow">Photo removal</p>
    <p class="contact__optout">If you're in one of my photos and want it taken down, <a href="mailto:${site.email}?subject=${encodeURIComponent("Photo removal request")}">email me</a> with a link to it and I'll remove it.</p>

  </div>
  <div class="contact__form">
    <h2 class="section-title">Send a message</h2>
    ${contactForm(site)}
  </div>
</div>`;

  return {
    path: "/contact/",
    section: "contact",
    theme: "crt",
    title: "Contact",
    description: `Get in touch with ${site.name}: photography bookings, collaborations, engineering, and research.`,
    body,
  };
}

export function photoInquiryPage(ctx) {
  const { site } = ctx;
  const body = html`
<div class="wrap crumbs-wrap">${breadcrumbs([{ label: "Contact", href: "/contact/" }, { label: "Photography inquiry" }])}</div>
${pageHead({
  section: "Photography",
  title: "Book / inquire",
})}
<div class="wrap inquiry">
  ${photoInquiryForm(site)}
  <aside class="inquiry__aside">
    <p class="eyebrow">Helpful to include</p>
    <ul class="bullets">
      <li>The date, and whether it's flexible</li>
      <li>Venue or location</li>
      <li>How you plan to use the photos</li>
      <li>Links to the band, event, or work you like</li>
    </ul>
    <p class="eyebrow">Or just email</p>
    <p><a href="mailto:${site.email}?subject=${encodeURIComponent("Photography inquiry")}">${site.email}</a></p>
    <p><a class="more mono" href="${url("/photography/")}">See the photography ${arrow}</a></p>
  </aside>
</div>`;

  return {
    path: "/contact/photography/",
    section: "contact",
    theme: "dark",
    title: "Photography inquiry",
    description: `Book ${site.name} to photograph a concert, band, skate session, event, or portrait.`,
    body,
  };
}

export function notFoundPage(ctx) {
  const body = html`
${pageHead({ section: "404", title: "Page not found" })}
<div class="wrap">
  <ul class="plain-list notfound">
    <li><a href="${url("/")}">Home ${arrow}</a></li>
    <li><a href="${url("/photography/")}">Photography ${arrow}</a></li>
    <li><a href="${url("/music/")}">Music ${arrow}</a></li>
    <li><a href="${url("/video/")}">Video ${arrow}</a></li>
    <li><a href="${url("/work/")}">Work ${arrow}</a></li>
    <li><a href="${url("/about/")}">About ${arrow}</a></li>
  </ul>
</div>`;
  return { path: "/404.html", section: "", theme: "crt", title: "Not found", body, noindex: true };
}
