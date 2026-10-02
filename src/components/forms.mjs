// Contact forms.
//
// Backend: set `forms.photo` / `forms.contact` in content/site.js to a Formspree / Basin /
// Getform (or your own Worker) URL and the form POSTs there with fetch().
// With no endpoint, submitting opens the visitor's email app with every field
// filled in, and the form says so. It never claims to have sent anything it didn't.
import { html } from "../../scripts/lib/html.mjs";

export const PHOTO_TYPES = ["Concert", "Band", "Skate", "Event", "Portrait", "Editorial", "Other"];

const field = ({ id, label, type = "text", required, placeholder = "", autocomplete = "", hint = "", full }) =>
  html`<div class="field${full ? " field--full" : ""}">
    <label for="${id}">${label}${required ? html`<span class="req" aria-hidden="true"> *</span>` : html`<span class="opt"> (optional)</span>`}</label>
    ${type === "textarea"
      ? html`<textarea id="${id}" name="${id}" rows="6" ${required ? "required" : ""} placeholder="${placeholder}"></textarea>`
      : html`<input id="${id}" name="${id}" type="${type}" ${required ? "required" : ""} placeholder="${placeholder}" ${autocomplete ? html`autocomplete="${autocomplete}"` : ""}>`}
    ${hint ? html`<p class="field__hint">${hint}</p>` : ""}
  </div>`;

function shell(site, { id, subject, submitLabel, fields, endpoint }) {
  const note = endpoint
    ? "Your message goes straight to John's inbox."
    : `Sending opens your email app with this message filled in, addressed to ${site.email}.`;
  return html`<form class="form" id="${id}" data-form ${endpoint ? html`action="${endpoint}" method="POST"` : html`action="mailto:${site.email}" method="post" enctype="text/plain"`}
      data-endpoint="${endpoint || ""}" data-email="${site.email}" data-subject="${subject}" novalidate>
    <div class="form__grid">${fields}</div>
    <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
    <div class="form__foot">
      <button class="btn btn--solid" type="submit">${submitLabel} <span class="arrow" aria-hidden="true">→</span></button>
      <p class="form__note mono">${note}</p>
    </div>
    <p class="form__status" role="status" aria-live="polite"></p>
  </form>`;
}

export function photoInquiryForm(site) {
  return shell(site, {
    id: "photo-inquiry",
    endpoint: site.forms?.photo,
    subject: "Photography inquiry",
    submitLabel: "Send inquiry",
    fields: [
      field({ id: "name", label: "Name", required: true, autocomplete: "name" }),
      field({ id: "email", label: "Email", type: "email", required: true, autocomplete: "email" }),
      field({ id: "organization", label: "Band / venue / organization", autocomplete: "organization" }),
      html`<div class="field">
        <label for="type">Type of shoot<span class="req" aria-hidden="true"> *</span></label>
        <select id="type" name="type" required>
          <option value="">Choose one</option>
          ${PHOTO_TYPES.map((t) => html`<option>${t}</option>`)}
        </select>
      </div>`,
      field({ id: "date", label: "Date", type: "date" }),
      field({ id: "location", label: "Location", placeholder: "Venue, city" }),
      field({ id: "budget", label: "Budget", placeholder: "A range is fine" }),
      field({ id: "reference", label: "Link or reference", type: "url", placeholder: "https://", hint: "Band page, event listing, a photo you like…" }),
      field({ id: "message", label: "Tell me about it", type: "textarea", required: true, full: true }),
    ],
  });
}

export function contactForm(site) {
  return shell(site, {
    id: "contact-form",
    endpoint: site.forms?.contact,
    subject: "Hello from your website",
    submitLabel: "Send message",
    fields: [
      field({ id: "c-name", label: "Name", required: true, autocomplete: "name" }),
      field({ id: "c-email", label: "Email", type: "email", required: true, autocomplete: "email" }),
      html`<div class="field field--full">
        <label for="c-topic">About<span class="opt"> (optional)</span></label>
        <select id="c-topic" name="topic">
          <option>General</option><option>Photography</option><option>Music</option><option>Engineering / research</option><option>Video</option>
        </select>
      </div>`,
      field({ id: "c-message", label: "Message", type: "textarea", required: true, full: true }),
    ],
  });
}
