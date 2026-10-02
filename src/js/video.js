// Click-to-load video: swap the thumbnail for the real player only on demand.
document.addEventListener("click", (e) => {
  const facade = e.target.closest(".video__facade");
  if (!facade || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  const frame = document.createElement("iframe");
  frame.src = facade.dataset.embed;
  frame.title = facade.dataset.title || "Video";
  frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
  frame.allowFullscreen = true;
  facade.replaceWith(frame);
  frame.focus();
});
