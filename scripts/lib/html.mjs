// Tiny HTML templating: `html` escapes every interpolated value unless it is
// already-safe markup (another html`` result or raw()). Arrays are joined.
import { url } from "./paths.mjs";

class Safe {
  constructor(s) {
    this.s = s;
  }
  toString() {
    return this.s;
  }
}

export const raw = (s) => new Safe(String(s ?? ""));

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

function render(v) {
  if (v == null || v === false || v === true) return "";
  if (v instanceof Safe) return v.s;
  if (Array.isArray(v)) return v.map(render).join("");
  return esc(v);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new Safe(out);
}

// Placeholder text such as "[ADD DESCRIPTION]" is treated as missing content.
export const isTodo = (s) => typeof s === "string" && /^\s*\[ADD\b/i.test(s);

export const isExternal = (href) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href);

// Anchor attributes for a link: external links and documents open in a new tab.
export function linkAttrs(href) {
  const newTab = isExternal(href) && !href.startsWith("mailto:") || /\.pdf$/i.test(href);
  return raw(`href="${esc(url(href))}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ""}`);
}

// Minimal inline markdown: [text](url), **bold**, *italic*, `code`.
function inline(text) {
  let s = esc(text);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const decoded = href.replace(/&amp;/g, "&");
    return `<a ${linkAttrs(decoded)}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

// Paragraphs from a string (blank-line separated) or an array of strings.
export function md(value, { placeholders = true } = {}) {
  if (!value) return raw("");
  const paras = (Array.isArray(value) ? value : String(value).split(/\n\s*\n/)).filter(Boolean);
  return raw(
    paras
      .map((p) =>
        isTodo(p)
          ? placeholders
            ? `<p class="todo">${esc(p.trim())}</p>`
            : ""
          : `<p>${inline(p.trim())}</p>`
      )
      .join("\n")
  );
}

export const mdInline = (s) => raw(inline(s));
