# Adding and editing content

Everything a visitor reads lives in `content/`. You shouldn't need to touch `src/` (templates and styles) to add work.

```
content/
  site.js          name, email, socials, homepage hero, categories, form backend
  about.js         About page: bio, education, experience, skills, writing
  photography/     one folder per shoot
  music/           one file per piece / instrument
  art/             one folder per series (collages, renders, …)
  video/           one file per video
  work/            one file per engineering project (and 3D art)
```

Preview while you edit:

```sh
npm install        # once
npm run dev        # http://localhost:8080, rebuilds on save; refresh the browser
```

`npm run dev` and `npm run build` print **content warnings** (missing alt text, a category that doesn't exist, a file path that doesn't resolve). Fix those before publishing.

---

## Photography

### 1. Pick your selects

Full-resolution camera files are **not** committed to git. They're too big for GitHub and Cloudflare. Keep originals wherever you like; `images/photos/` is already git-ignored for that purpose.

Put the photos you want on the site for one shoot into a folder. The folder name becomes the default title and URL:

```
images/photos/_selects/Grifter Ball 2026/
  DSC03921.jpg
  DSC04010.jpg
  ...
```

### 2. Import

```sh
npm run photos:import -- "images/photos/_selects/Grifter Ball 2026" --category concerts
```

To import only some photos from a big folder (including ones in subfolders), put their paths, relative to the folder, one per line in a text file and add `--list picks.txt`. The order in the file becomes the gallery order.

Options: `--slug grifter-ball-2026` (URL), `--title "Grifter Ball"`, `--category concerts`, `--force` (re-encode photos already imported).

This creates `content/photography/grifter-ball-2026/` with:

- `photos/`: web masters (2560 px long edge, sRGB JPEG, **all metadata stripped including GPS**, rotation applied). Typically 100–600 KB each.
- `photos.json`: one entry per photo, in gallery order.
- `index.js`: project details. The date is filled in from the photos' capture date.

Your originals are never modified.

### 3. Fill in the details

`index.js`:

```js
export default {
  title: "Grifter Ball",
  category: "concerts",        // concerts | skate | events | documentary | portraits | personal
  date: "2026-03-14",          // or "2026-03" or "2026"
  location: "Des Moines, IA",
  description: "One or two sentences. [Links](https://…) and **bold** work.",
  featured: true,              // optional: show on the homepage
  cover: "DSC04010",           // optional: cover photo (file name without extension); default is the first
  credits: [{ role: "Photography", name: "John Brittain" }],   // optional
  links: [{ label: "Band on Instagram", url: "https://instagram.com/…" }], // optional
  inquire: true,               // optional: show the "Book / inquire" block (default true)
  draft: true,                 // optional: hide from the live site (still visible in npm run dev)
};
```

`photos.json`: write **alt text** for every photo (what's in it, for screen readers and search), and reorder entries to change the gallery order:

```json
[
  { "file": "DSC04010.jpg", "alt": "Singer leaning into the crowd under red light", "caption": "" },
  { "file": "DSC03921.jpg", "alt": "Drummer mid-hit, blurred sticks", "caption": "", "span": "full" },
  { "file": "DSC04044.jpg", "alt": "…", "hidden": true }
]
```

- `"span": "full"` gives a photo a row to itself.
- `"hidden": true` keeps the file but leaves it out of the gallery.
- `caption` appears under the photo and in the full-screen viewer.

Portrait and landscape photos mix freely. The gallery keeps every photo at its own shape and fills each row, so nothing gets cropped. On phones each photo is full width.

### 4. Put your photos on the homepage

In `content/site.js`, replace the `hero` images (currently 3D renders) with photographs:

```js
hero: [
  { src: "content/photography/grifter-ball-2026/photos/DSC04010.jpg", alt: "…", caption: "Grifter Ball, 2026" },
  ...
],
```

The homepage photography band shows your three most recent shoots automatically, and projects with `featured: true` appear under "Selected & recent".

When you have real shoots, set `showPlaceholders: false` in `content/site.js` to remove every dashed "[ADD …]" slot.

### Categories

Categories are defined once, in `content/site.js` → `categories.photography`. Add, rename, or reorder them there. Each shoot's `category` must match a `slug`. Filters only appear for categories that have work in them, and `/photography/#skate` links straight to a filtered view.

---

## Music

Add `content/music/<slug>.js`:

```js
export default {
  title: "Sea of Tranquility",
  category: "composition",     // composition | sound-design | instruments | experiments
  date: "2026-05",             // optional
  featured: true,              // optional
  description: "What it is, how it was made.",
  audio: [{ src: "/audiofiles/Sea_of_Tranquility.mp3", title: "Sea of Tranquility" }],
  cover: "/images/music/sea-of-tranquility.jpg",   // optional artwork
  embeds: [                                        // optional: Bandcamp / SoundCloud / Spotify
    { provider: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/album=…/size=large/…", height: 120 },
  ],
  video: { youtube: "VIDEO_ID" },                  // optional
  credits: [{ role: "Mixing", name: "…" }],        // optional
  tools: ["Ableton Live"],                         // optional
  links: [{ label: "Bandcamp", url: "https://…" }],// optional
};
```

- **Audio files** go in `public/audiofiles/`. Export MP3 at 192–320 kbps. Nothing downloads until someone presses play.
- **Embeds:** copy the `src` URL out of the service's "Embed" code. Allowed hosts are Bandcamp, SoundCloud (`w.soundcloud.com`), Spotify (`open.spotify.com`), YouTube, and Vimeo. Adding another host means adding it to `frame-src` in `src/layout.mjs`.
- An engineering project can also appear in Music: add `alsoIn: ["music"]` to it in `content/work/`.

---

## Engineering (Work)

Add `content/work/<slug>.js`. Every field except `title` and `category` is optional, and empty sections don't render:

```js
export default {
  title: "Rxn Bench",
  subtitle: "One-line context",   // shown next to the title, e.g. "Senior Design Project"
  summary: "One sentence, shown under the title and on cards.",
  status: "in-progress",        // optional: adds an "In progress" badge
  category: "lab-automation",   // see content/site.js → categories.work
  date: "2026",
  dateLabel: "2025 – present",  // optional: overrides how the date is shown
  featured: true,
  cover: "/images/projects/rxn-bench.jpg",
  description: "Overview paragraph(s).",
  problem: "What needed solving.",
  solution: "What you built.",
  results: "What it achieved.",
  details: ["Technical point", "Another point"],   // list or paragraph
  role: "What you did.",
  tools: ["LabVIEW", "Python"],
  skills: ["…"],
  tags: ["…"],
  images: [
    { src: "/images/projects/rxn-bench-1.jpg", alt: "…", caption: "…" },
    { src: "/images/projects/rxn-bench-diagram.png", alt: "…", caption: "System diagram" },
  ],
  video: { youtube: "VIDEO_ID", aspect: "16/9" },  // "9/16" for Shorts
  links: [{ label: "GitHub repository", url: "https://github.com/…" }],
  documents: [{ label: "Final report", file: "/documents/reports/rxn-bench.pdf" }],
  collaborators: [{ name: "…", role: "…" }],
  alsoIn: ["music"],            // cross-list in another section
};
```

Images for engineering projects go in `public/images/projects/`. Animated GIFs stay animated (they're converted to animated WebP, which is smaller). PDFs go in `public/documents/`. Use any size of image; the build makes the web sizes.

One placeholder is waiting to be filled in: `rxn-bench.js`. Delete `placeholder: true` once it has real content.

---

## Art

Each series is a folder in `content/art/`, set up just like a photography project. Import a folder of finished pieces:

```sh
npm run photos:import -- "images/photos/John's Wacky World Vol-2" --section art --category collage --title "John's Wacky World, Vol. 2"
```

Then set `summary`, `description`, and `order` in its `index.js`, and fill in `photos.json`: `caption` is the piece's title (shown under it and in the viewer), and `alt` describes what's in it. Categories are in `content/site.js` → `categories.art` (currently Collage and 3D Renders). Series can also list images directly instead of using a `photos/` folder; see `content/art/3d-renders.js`.

---

## Video

Add `content/video/<slug>.js`:

```js
export default {
  title: "Band — Song",
  subtitle: "Music video",
  category: "music-videos",     // music-videos | animation | documentary | demos
  date: "2026-10",
  video: { youtube: "VIDEO_ID" },   // or { vimeo: "123456789" }
  description: "…",
  credits: [{ role: "Director", name: "John Brittain" }, { role: "Band", name: "…" }],
  links: [{ label: "Watch on YouTube", url: "https://youtu.be/…" }],
};
```

Demo videos attached to music or engineering projects show up on the Video page automatically, so don't duplicate them here. Delete `content/video/music-video-placeholder.js` once you add a real music video.

---

## About, contact, and socials

- **Bio, education, experience, skills, writing:** `content/about.js`. A skill can be a plain string or `{ label: "VHDL", href: "/work/#digital-design" }` to link it to the work that shows it.
- **Email, social links, résumé path:** `content/site.js`. Social entries with `url: null` are hidden; fill in Instagram and your music platform there.
- **Résumé:** replace `public/documents/Resume.pdf` (keep the file name so old links keep working).
- **Portrait:** `public/images/profile/professionalportrait.jpg`.

## Forms

By default both forms open the visitor's email app with everything filled in, and the form says so. To receive submissions directly:

1. Create a free form at [Formspree](https://formspree.io) (or Basin, Getform, or a Cloudflare Worker that accepts a POST).
2. Paste its endpoint into `content/site.js` → `forms.photo` (booking form) or `forms.contact` (general form).

The build adds that origin to the Content-Security-Policy automatically. Both forms include a hidden `_gotcha` honeypot field for spam. Formspree understands it natively; other services may need it configured.

## Where the originals live

`images/photos/` (git-ignored) mirrors the site: one folder per collection, named exactly like the collection title (e.g. `Night Creatures`, `Des Moines After Dark`, `Woodland Cemetery`). To add photos to a collection, put them in its folder and import with `--list` (or re-import the whole folder). `_Other/` holds originals that aren't in a collection: the pedal board build photos (used on the FPGA Looper page), the self portrait (About page), and anything unplaced.
