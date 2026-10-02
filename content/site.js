// Site-wide settings. Everything a visitor sees that isn't a single project lives here.
// Paths that start with "/" point into public/ (e.g. "/documents/Resume.pdf").

export default {
  name: "John Brittain",
  tagline: "photography / music / machines",
  description:
    "John Brittain makes photographs, music, and machines: concert, skate, and event photography; composition and sound design; and engineering work in lab automation, robotics, and digital hardware.",

  // The eventual production domain. Override at build time with the SITE_URL
  // environment variable (the GitHub Pages workflow does this).
  url: "https://johnbrittain.com",

  location: "Des Moines, Iowa",
  email: "johndbrittain@outlook.com",

  resume: "/documents/Resume.pdf",
  // Set to an image path (e.g. "/images/profile/portrait.jpg") to show a portrait on
  // the About page and homepage; null shows a placeholder frame.
  portrait: null,
  // Synthwave header art from the previous site, reused as the Music page banner.
  musicBanner: "/images/site/Website_Header.png",
  repo: "https://github.com/JohnBrittaein/resume-website",

  // Links with url: null are hidden until you fill them in.
  socials: [
    { label: "Instagram", url: "https://www.instagram.com/john_brittaein/" },
    { label: "GitHub", url: "https://github.com/JohnBrittaein" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/john-brittain-539290274/" },
    { label: "Spotify", url: "https://open.spotify.com/artist/0mH1mefR44UoLHJh1pTFmk" },
  ],

  // Form backends (Formspree). Set one to null and that form falls back to
  // opening the visitor's email app with the message filled in.
  forms: {
    photo: "https://formspree.io/f/xdekvjev", // photography booking form (/contact/photography/)
    contact: "https://formspree.io/f/xnpnyrpw", // general contact form (/contact/)
  },

  // Dashed "[ADD …]" slots that mark where content is still missing.
  // Set to false before you share the site widely.
  showPlaceholders: false,

  // Homepage. `roles` is the line under your name (each links to its section).
  // `tiles` picks the photos for the four big homepage tiles:
  // [collection folder, photo file name without extension].
  home: {
    roles: [
      { label: "Photographer", href: "/photography/" },
      { label: "Musician", href: "/music/" },
      { label: "Artist", href: "/art/" },
      { label: "Engineer", href: "/work/" },
    ],
    tiles: {
      photography: [
        ["dsm-street-style-open-2026", "DSC06408"],
        ["juno-driver-anchoress", "DSC04938-2"],
        ["grifter-ball-2026", "DSC04338"],
      ],
      art: ["johns-wacky-world-vol-1", "Cigarette Coyote"],
      work: ["fpga-looper", "20260513_233106"],
    },
  },

  // Categories per section. Add or rename freely; each item's `category`
  // must match one of these slugs. Order here is the order of the filters.
  categories: {
    // group "shows": one gallery per event, listed newest first under "Shows & Events".
    // group "collections": galleries organized by subject, listed under "Collections".
    photography: [
      { slug: "concerts", label: "Concerts", group: "shows" },
      { slug: "events", label: "Events", group: "shows" },
      { slug: "skate", label: "Skate", group: "shows" },
      { slug: "street", label: "Street", group: "collections" },
      { slug: "portraits", label: "Portraits", group: "collections" },
      { slug: "landscape", label: "Landscape", group: "collections" },
      { slug: "architecture", label: "Architecture", group: "collections" },
      { slug: "animals", label: "Animals", group: "collections" },
      { slug: "documentary", label: "Documentary", group: "collections" },
      { slug: "still-life", label: "Still Life", group: "collections" },
    ],
    music: [
      { slug: "releases", label: "Releases" },
      { slug: "composition", label: "Composition" },
      { slug: "sound-design", label: "Sound Design" },
      { slug: "instruments", label: "Instruments" },
      { slug: "experiments", label: "Audio Experiments" },
    ],
    video: [
      { slug: "music-videos", label: "Music Videos" },
      { slug: "animation", label: "Animation" },
      { slug: "documentary", label: "Documentary" },
      { slug: "demos", label: "Demos" },
    ],
    work: [
      { slug: "lab-automation", label: "Lab Automation" },
      { slug: "robotics", label: "Robotics" },
      { slug: "embedded", label: "Embedded Systems" },
      { slug: "digital-design", label: "Digital Design" },
      { slug: "audio-tech", label: "Audio Tech" },
      { slug: "software", label: "Software & Apps" },
      { slug: "machine-learning", label: "AI & Machine Learning" },
      { slug: "cool-stuff", label: "Cool Stuff" },
    ],
    art: [
      { slug: "collage", label: "Collage" },
      { slug: "3d", label: "3D Renders" },
    ],
  },
};
