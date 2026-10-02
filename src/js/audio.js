// Audio players. The page ships a native <audio controls> (works without JS);
// this swaps in a simpler play / scrub / time UI and makes sure only one
// track plays at a time. preload="none" means no audio downloads until played.
const players = [...document.querySelectorAll("[data-player]")];
const fmtTime = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "–:––");

players.forEach((p) => {
  const audio = p.querySelector("audio");
  const ui = p.querySelector(".player__ui");
  const btn = p.querySelector(".player__btn");
  const seek = p.querySelector(".player__seek");
  const cur = p.querySelector("[data-cur]");
  const dur = p.querySelector("[data-dur]");
  const label = btn.dataset.label;
  let scrubbing = false;
  let pendingSeek = null;

  audio.controls = false;
  audio.hidden = true;
  ui.hidden = false;

  const paint = (fraction) => {
    seek.value = Math.round(fraction * 1000);
    seek.style.setProperty("--pct", `${fraction * 100}%`);
  };

  btn.addEventListener("click", () => (audio.paused ? audio.play() : audio.pause()));

  audio.addEventListener("play", () => {
    players.forEach((other) => other !== p && other.querySelector("audio").pause());
    p.classList.add("is-playing");
    btn.setAttribute("aria-label", `Pause ${label}`);
  });
  const stopped = () => {
    p.classList.remove("is-playing");
    btn.setAttribute("aria-label", `Play ${label}`);
  };
  audio.addEventListener("pause", stopped);
  audio.addEventListener("ended", stopped);

  audio.addEventListener("loadedmetadata", () => {
    dur.textContent = fmtTime(audio.duration);
    if (pendingSeek !== null) {
      audio.currentTime = pendingSeek * audio.duration;
      pendingSeek = null;
    }
  });
  audio.addEventListener("timeupdate", () => {
    if (scrubbing || !audio.duration) return;
    paint(audio.currentTime / audio.duration);
    cur.textContent = fmtTime(audio.currentTime);
  });

  seek.addEventListener("input", () => {
    scrubbing = true;
    const f = seek.value / 1000;
    paint(f);
    if (audio.duration) cur.textContent = fmtTime(f * audio.duration);
  });
  seek.addEventListener("change", () => {
    scrubbing = false;
    const f = seek.value / 1000;
    if (audio.duration) audio.currentTime = f * audio.duration;
    else {
      // Nothing loaded yet: fetch metadata, then jump.
      pendingSeek = f;
      audio.preload = "metadata";
      audio.load();
    }
  });

  audio.addEventListener("error", () => {
    // Fall back to the browser's own player so the failure is visible.
    ui.hidden = true;
    audio.hidden = false;
    audio.controls = true;
  });
});
