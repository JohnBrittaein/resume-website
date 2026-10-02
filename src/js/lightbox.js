// Full-screen image viewer for any <a data-lightbox="group">.
//
// Opens with the whole image fitted to the screen. Zoom with the button, by
// clicking/tapping the image, or with +/-; drag (or scroll on touch screens)
// to look around. Arrow keys / swipe move between images, Esc zooms out and
// then closes. Without JavaScript the link simply opens the image file.
const zoomLinks = [...document.querySelectorAll("a[data-lightbox]")];
if (zoomLinks.length) {
  let dlg, stage, lbImg, lbCap, lbCount, lbPrev, lbNext, lbZoom;
  let group = [];
  let index = 0;
  let opener = null;
  let zoomed = false;

  // Where the picture actually sits inside the fitted <img> box (object-fit: contain).
  const contentRect = () => {
    const box = lbImg.getBoundingClientRect();
    const cs = getComputedStyle(lbImg);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const availW = box.width - padX;
    const availH = box.height - padY;
    const a = group[index];
    const ratio = +a.dataset.w / +a.dataset.h || 1;
    const w = Math.min(availW, availH * ratio);
    const h = w / ratio;
    return {
      left: box.left + parseFloat(cs.paddingLeft) + (availW - w) / 2,
      top: box.top + parseFloat(cs.paddingTop) + (availH - h) / 2,
      width: w,
      height: h,
    };
  };

  const zoomIn = (clientX, clientY) => {
    if (zoomed) return;
    const r = contentRect();
    const px = clientX == null ? 0.5 : (clientX - r.left) / r.width;
    const py = clientY == null ? 0.5 : (clientY - r.top) / r.height;
    const natural = +group[index].dataset.w || lbImg.naturalWidth;
    const scale = Math.min(4, Math.max(2, natural / r.width));
    const w = Math.round(r.width * scale);
    const h = Math.round(r.height * scale);
    lbImg.sizes = `${w}px`; // fetch a sharper file for the zoomed view
    lbImg.style.width = `${w}px`;
    lbImg.style.height = `${h}px`;
    stage.classList.add("is-zoomed");
    stage.scrollLeft = px * w - stage.clientWidth / 2;
    stage.scrollTop = py * h - stage.clientHeight / 2;
    zoomed = true;
    lbZoom.textContent = "Fit ⤡";
    lbZoom.setAttribute("aria-pressed", "true");
  };

  const fit = () => {
    if (!zoomed) return;
    stage.classList.remove("is-zoomed");
    lbImg.style.width = lbImg.style.height = "";
    lbImg.sizes = "100vw";
    zoomed = false;
    lbZoom.textContent = "Zoom ⤢";
    lbZoom.setAttribute("aria-pressed", "false");
  };

  const buildLightbox = () => {
    dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", "Image viewer");
    dlg.innerHTML = `
      <div class="lightbox__bar">
        <span class="lightbox__count" aria-live="polite"></span>
        <span class="lightbox__tools">
          <button type="button" data-zoom aria-pressed="false">Zoom ⤢</button>
          <button type="button" data-close>Close ✕</button>
        </span>
      </div>
      <div class="lightbox__stage"><img class="lightbox__img" alt=""></div>
      <div class="lightbox__foot">
        <button type="button" class="lightbox__nav" data-prev aria-label="Previous image">← Prev</button>
        <p class="lightbox__caption"></p>
        <button type="button" class="lightbox__nav" data-next aria-label="Next image">Next →</button>
      </div>`;
    document.body.append(dlg);
    stage = dlg.querySelector(".lightbox__stage");
    lbImg = dlg.querySelector(".lightbox__img");
    lbCap = dlg.querySelector(".lightbox__caption");
    lbCount = dlg.querySelector(".lightbox__count");
    lbPrev = dlg.querySelector("[data-prev]");
    lbNext = dlg.querySelector("[data-next]");
    lbZoom = dlg.querySelector("[data-zoom]");

    dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
    lbZoom.addEventListener("click", () => (zoomed ? fit() : zoomIn()));
    lbPrev.addEventListener("click", () => show(index - 1));
    lbNext.addEventListener("click", () => show(index + 1));

    dlg.addEventListener("keydown", (e) => {
      if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-" || e.key === "0") fit();
      else if (!zoomed && e.key === "ArrowLeft") show(index - 1);
      else if (!zoomed && e.key === "ArrowRight") show(index + 1);
    });
    // Esc: first leave zoom, then close.
    dlg.addEventListener("cancel", (e) => {
      if (zoomed) {
        e.preventDefault();
        fit();
      }
    });
    dlg.addEventListener("close", () => {
      fit();
      document.documentElement.classList.remove("menu-open");
      opener?.focus();
    });

    // Mouse: click to zoom in/out, drag to pan while zoomed.
    // Touch: tap to zoom, swipe to change image (when not zoomed); zoomed
    // images pan with normal finger scrolling.
    let down = null;
    stage.addEventListener("pointerdown", (e) => {
      down = { x: e.clientX, y: e.clientY, sl: stage.scrollLeft, st: stage.scrollTop, type: e.pointerType, moved: false };
      if (zoomed && e.pointerType === "mouse") {
        stage.setPointerCapture(e.pointerId);
        stage.classList.add("is-dragging");
      }
    });
    stage.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) down.moved = true;
      if (zoomed && down.type === "mouse") {
        stage.scrollLeft = down.sl - dx;
        stage.scrollTop = down.st - dy;
      }
    });
    const release = (e) => {
      if (!down) return;
      const d = down;
      down = null;
      stage.classList.remove("is-dragging");
      if (e.type === "pointercancel") return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!zoomed && d.type !== "mouse" && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        show(index + (dx < 0 ? 1 : -1));
        return;
      }
      if (d.moved) return;
      if (zoomed) return fit();
      const r = contentRect();
      const inside = e.clientX >= r.left && e.clientX <= r.left + r.width && e.clientY >= r.top && e.clientY <= r.top + r.height;
      inside ? zoomIn(e.clientX, e.clientY) : dlg.close();
    };
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);
  };

  const preload = (a) => {
    if (!a) return;
    const im = new Image();
    im.sizes = "100vw";
    im.srcset = a.dataset.srcset;
  };

  const show = (i) => {
    fit();
    index = (i + group.length) % group.length;
    const a = group[index];
    lbImg.removeAttribute("src");
    lbImg.width = +a.dataset.w;
    lbImg.height = +a.dataset.h;
    lbImg.sizes = "100vw";
    lbImg.srcset = a.dataset.srcset;
    lbImg.src = a.href;
    lbImg.alt = a.dataset.alt || "";
    lbCap.textContent = a.dataset.caption || "";
    const many = group.length > 1;
    lbCount.textContent = many ? `${index + 1} / ${group.length}` : "";
    lbPrev.hidden = lbNext.hidden = !many;
    if (many) {
      preload(group[(index + 1) % group.length]);
      preload(group[(index - 1 + group.length) % group.length]);
    }
  };

  zoomLinks.forEach((a) =>
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if (!dlg) buildLightbox();
      group = zoomLinks.filter((l) => l.dataset.lightbox === a.dataset.lightbox);
      opener = a;
      dlg.showModal();
      document.documentElement.classList.add("menu-open"); // reuse the scroll lock
      show(group.indexOf(a));
      dlg.querySelector("[data-close]").focus();
    })
  );
}
