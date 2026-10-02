// Category filters. The choice lives in the URL hash (/photography/#skate), so
// filtered views can be linked to directly.
document.querySelectorAll("[data-filters]").forEach((bar) => {
  const target = document.getElementById(bar.dataset.filters);
  if (!target) return;
  const buttons = [...bar.querySelectorAll("[data-filter]")];
  const entries = [...target.querySelectorAll("[data-cat]")];
  const empty = target.querySelector(".filter-empty");
  const known = new Set(buttons.map((b) => b.dataset.filter));
  target.classList.add("js-filtered");

  const apply = (cat, updateUrl) => {
    if (!known.has(cat)) cat = "all";
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === cat)));
    let shown = 0;
    entries.forEach((el) => {
      const match = cat === "all" || el.dataset.cat.split(" ").includes(cat);
      el.toggleAttribute("data-filtered-out", !match);
      // Alternate layout by visible position, not DOM position.
      el.toggleAttribute("data-alt", match && shown % 2 === 1);
      if (match) shown++;
    });
    if (empty) empty.hidden = shown > 0;
    if (updateUrl) history.replaceState(null, "", cat === "all" ? location.pathname + location.search : `#${cat}`);
  };

  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter, true)));
  const fromHash = () => apply(decodeURIComponent(location.hash.slice(1)) || "all", false);
  window.addEventListener("hashchange", fromHash);
  fromHash();
});
