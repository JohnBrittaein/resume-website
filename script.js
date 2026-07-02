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

document.querySelectorAll(".project-item img").forEach((image) => {
  image.addEventListener("click", () => {
    openLightbox(image.src);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});

function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  lightbox.style.display = "flex";
  lightboxImg.src = src;
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  lightbox.style.display = "none";
}


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
      activateTab(slide.dataset.targetTab);
      const projectEl = document.querySelector(slide.dataset.targetProject);
      if (!projectEl) return;
      setTimeout(() => {
        projectEl.scrollIntoView({ behavior: "smooth", block: "center" });
        projectEl.classList.add("project-highlight");
        setTimeout(() => projectEl.classList.remove("project-highlight"), 1800);
      }, 50);
    });
  });

  render();
  startAutoplay();
}



