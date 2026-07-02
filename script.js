if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("Service Worker Registered"));
}

function toggleDropdown(dropdownID) {
  var content = document.getElementById(dropdownID);
  if (content.style.display === "block") {
    content.style.display = "none";
  } else {
    content.style.display = "block";
  }
}

let lightboxImages = [];
let lightboxIndex = 0;
let lightboxGallery = null;

document.querySelectorAll(".project-item img").forEach((image) => {
  image.addEventListener("click", () => {
    const gallery = image.closest("[data-gallery]");
    if (gallery && gallery.galleryImages) {
      openLightbox(gallery.galleryImages, gallery.currentIndex, gallery);
    } else {
      openLightbox([image.src], 0, null);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (document.getElementById("lightbox").style.display !== "flex") return;
  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowRight") {
    lightboxGoTo(lightboxIndex + 1);
  } else if (event.key === "ArrowLeft") {
    lightboxGoTo(lightboxIndex - 1);
  }
});

function openLightbox(images, index, gallery) {
  lightboxImages = images;
  lightboxIndex = index;
  lightboxGallery = gallery;
  renderLightbox();
  document.getElementById("lightbox").style.display = "flex";
}

function renderLightbox() {
  document.getElementById("lightbox-img").src = lightboxImages[lightboxIndex];
  const hasMultiple = lightboxImages.length > 1;
  document.getElementById("lightbox-prev").style.display = hasMultiple ? "flex" : "none";
  document.getElementById("lightbox-next").style.display = hasMultiple ? "flex" : "none";
}

function lightboxGoTo(i) {
  lightboxIndex = (i + lightboxImages.length) % lightboxImages.length;
  renderLightbox();
  if (lightboxGallery) lightboxGallery.goToImage(lightboxIndex);
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.style.display = "none";
}

document.getElementById("lightbox-prev").addEventListener("click", (event) => {
  event.stopPropagation();
  lightboxGoTo(lightboxIndex - 1);
});
document.getElementById("lightbox-next").addEventListener("click", (event) => {
  event.stopPropagation();
  lightboxGoTo(lightboxIndex + 1);
});


document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name    = document.getElementById('contact-name').value.trim();
  const email   = document.getElementById('contact-email').value.trim();
  const subject = document.getElementById('contact-subject').value.trim();
  const message = document.getElementById('contact-message').value.trim();

  if (!name || !email || !subject || !message) {
    alert('Please fill in all fields before sending.');
    return;
  }

  const body = `From: ${name} (${email})\n\n${message}`;
  const mailto = `mailto:johndbrittain@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
});

const tabs = document.querySelectorAll('[data-tab-target]')
const tabContents = document.querySelectorAll('[data-tab-content]')

function activateTab(targetSelector) {
  const targetTab = Array.from(tabs).find((tab) => tab.dataset.tabTarget === targetSelector)
  const targetContent = document.querySelector(targetSelector)
  if (!targetTab || !targetContent) return
  tabContents.forEach((tabContent) => tabContent.classList.remove('active'))
  tabs.forEach((tab) => tab.classList.remove('active'))
  targetTab.classList.add('active')
  targetContent.classList.add('active')
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tabTarget))
})

function jumpToTarget(tabSelector, targetSelectors) {
  if (tabSelector) activateTab(tabSelector);
  const selectors = targetSelectors.split(",").map((s) => s.trim()).filter(Boolean);
  const targetEls = selectors.map((sel) => document.querySelector(sel)).filter(Boolean);
  if (targetEls.length === 0) return;
  setTimeout(() => {
    targetEls[0].scrollIntoView({ behavior: "smooth", block: "center" });
    targetEls.forEach((el) => {
      el.classList.add("project-highlight");
      setTimeout(() => el.classList.remove("project-highlight"), 1800);
    });
  }, 50);
}

document.querySelectorAll(".skill-tag-link[data-target-projects]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    jumpToTarget(link.dataset.targetTab, link.dataset.targetProjects);
  });
});

// Featured Projects Carousel
const featuredCarousel = document.querySelector(".featured-carousel");
if (featuredCarousel) {
  const track = featuredCarousel.querySelector(".featured-track");
  const slides = Array.from(featuredCarousel.querySelectorAll(".featured-slide"));
  const dotsContainer = featuredCarousel.querySelector(".featured-dots");
  const prevBtn = featuredCarousel.querySelector(".featured-prev");
  const nextBtn = featuredCarousel.querySelector(".featured-next");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoplayDelay = parseInt(featuredCarousel.dataset.autoplay, 10) || 6000;

  let index = 0;
  let autoplayTimer = null;

  slides.forEach((slide, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "featured-dot";
    dot.setAttribute("aria-label", `Go to featured project ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, true));
    dotsContainer.appendChild(dot);
  });
  const dots = Array.from(dotsContainer.children);

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  }

  function goTo(i, userInitiated) {
    index = (i + slides.length) % slides.length;
    render();
    if (userInitiated) restartAutoplay();
  }

  function startAutoplay() {
    if (prefersReducedMotion || slides.length <= 1) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => goTo(index + 1), autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  prevBtn.addEventListener("click", () => goTo(index - 1, true));
  nextBtn.addEventListener("click", () => goTo(index + 1, true));

  featuredCarousel.addEventListener("mouseenter", stopAutoplay);
  featuredCarousel.addEventListener("mouseleave", startAutoplay);
  featuredCarousel.addEventListener("focusin", stopAutoplay);
  featuredCarousel.addEventListener("focusout", startAutoplay);

  slides.forEach((slide) => {
    const link = slide.querySelector(".featured-slide-link");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      jumpToTarget(slide.dataset.targetTab, slide.dataset.targetProject);
    });
  });

  render();
  startAutoplay();
}

// Project Card Photo Galleries
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const images = gallery.dataset.images.split(",").map((s) => s.trim()).filter(Boolean);
  const imgEl = gallery.querySelector("[data-gallery-img]");
  const counterEl = gallery.querySelector("[data-gallery-counter]");
  const prevBtn = gallery.querySelector(".gallery-prev");
  const nextBtn = gallery.querySelector(".gallery-next");

  gallery.galleryImages = images;
  gallery.currentIndex = 0;

  function render() {
    imgEl.src = images[gallery.currentIndex];
    counterEl.textContent = `${gallery.currentIndex + 1} / ${images.length}`;
  }

  gallery.goToImage = (i) => {
    gallery.currentIndex = (i + images.length) % images.length;
    render();
  };

  prevBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    gallery.goToImage(gallery.currentIndex - 1);
  });
  nextBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    gallery.goToImage(gallery.currentIndex + 1);
  });

  render();
});

