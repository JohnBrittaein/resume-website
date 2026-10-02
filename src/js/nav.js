// Mobile menu.
const menuBtn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");
if (menuBtn && menu) {
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    document.documentElement.classList.toggle("menu-open", open);
  };
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  matchMedia("(min-width: 861px)").addEventListener("change", (e) => e.matches && setMenu(false));
}

// The previous version of the site registered a cache-first service worker.
// Remove it for anyone who still has it, so they always get the current site.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
}
