# What changed in v3, and what needs your attention

## Branch

This work sits on the branch **`redesign`**, which starts from `origin/main` (commit `d765da6`, "Polish tab/panel spacing and wording fixes"), so it includes everything from the latest version of the old site. Nothing is committed yet. `add-projects` and `main` were not touched.

## Where the old content went

Nothing from the previous site was deleted. It was reclassified.

| Previous site (`origin/main`) | New home |
| --- | --- |
| Header, About Me, contact info | `/about/`, `/contact/` |
| Skill tags that jumped to projects | `/about/` → Skills: the same groups, and each tag links to its project page |
| Academics | `/about/` → Background → Education |
| Work History (Ames National Laboratory) | `/about/` → Experience, plus `/work/rxn-rover/` |
| Featured projects carousel | the homepage "Selected & recent" (CYFLYBOT, FPGA Looper, You Can Run, Wackah Mole) plus the Armonica instrument |
| Hardware & Embedded tab | `/work/`: CYFLYBOT, 12-Step Sequencer, Clean Up Robot, MIPS CPUs, FPGA Audio Looping Station |
| Software & Apps tab | `/work/`: This Website, Fallout Terminal, Cat vs. Dogs, You Can Run, Wackah Mole, Blockchain Flight Insurance, Checkers AI, MNIST, RL Couch |
| Audio tab (5 MP3s) | `/music/` with players |
| Artwork tab (16 renders, PLANET) | `/art/3d-renders/`; PLANET at `/video/planet/` |
| (new) John's Wacky World collages | `/art/johns-wacky-world-vol-1/` (15 collages, imported from `images/photos/John's Wacky World Vol. 1`) |
| Cool Stuff tab | `/work/` → "Cool Stuff" filter: Peavey Mantis refinish, Motion capture platform. The Max sequencer and both loopers are under "Audio Tech". The instruments are also listed in `/music/`. |
| "In Progress" badges | kept (`status: "in-progress"`): CYFLYBOT, Multi-Effects Looper, Motion capture platform |
| Per-project image galleries | project pages with the full-screen viewer (Guitar refinish: all 7 steps; Multi-Effects Looper: CAD + PCB) |
| Reflections & Writings | `/work/` → Writing & research, and `/about/` |
| All YouTube demos | on each project page, and collected on `/video/` |
| Contact form (opened email app) | `/contact/` and `/contact/photography/`; same behavior until a form backend is configured |

Old URLs for files keep working: `documents/…` (including `documents/Resume.pdf`), `images/…`, and `audiofiles/…` live in `public/` at the same paths.

The previous site's `index.html`, `style.css`, and `script.js` are kept for reference: `legacy/v2-single-page/latest-main/` is the `origin/main` version. The files directly in `legacy/v2-single-page/` are the older `add-projects` version, including the Content-Security-Policy you'd added but not committed (the new site carries that policy forward). Delete the folder whenever you like.

## Look

The retro look of the old site is back: Inconsolata (the old site's font), the white phosphor glow on headings, and yellow `#ffd900` accents. There are no gradients or scanlines; each section has one solid color:

- **Home, About, Contact:** midnight navy `#0a0e27`
- **Photography, Video:** neutral `#0a0a0a`, so photos aren't tinted
- **Music:** purple `#1a0b2e`, under your old `Website_Header.png` art
- **Art:** warm dark gallery wall `#1d1a17`
- **Work:** blueprint blue `#0d3170` with a drafting grid

All colors and fonts are tokens in `src/styles/tokens.css`.

## Content that needs you

**Missing:**

- **Photography:** you're choosing about 50 selects. Import them with `npm run photos:import` (see `docs/CONTENT.md`). Until then the photography pages show clearly marked "[ADD PHOTOGRAPHY PROJECT]" slots.
- **Homepage hero:** currently three Wacky World collages. Swap in photographs in `content/site.js` → `hero` if you'd rather lead with photography.
- **Wacky World description:** `content/art/johns-wacky-world-vol-1/index.js` still says "[ADD DESCRIPTION]". I wrote its one-line summary and the alt text for each collage from the images; check them. The three untitled pieces are captioned "Untitled".
- **Instagram** and a **music platform** link: `null` in `content/site.js`.
- **Rxn Bench:** added from the project repo (github.com/RxnRover/automated_chem_bench); SULI internship listed on the About page.
- **Music video:** a placeholder slot on `/video/`.

**Worth a read:**

- **Bio copy:** `content/about.js` → `intro`, and the short versions in `src/pages/home.mjs`. It says you currently work at Ames National Laboratory (the old site listed that role as "present").
- **"This Website"** (`content/work/this-website.js`): the first paragraph is new, describing this version. The old description is kept as the second paragraph.
- **Music categories are guesses:** Sea of Tranquility and Binary Bond → Composition; Sound Collage → Audio Experiments; the ringtone and "Getting Wine Drunk…" → Sound Design. The five tracks and PLANET have no descriptions yet.
- **Dates:** only CYFLYBOT (2026) and RxnRover (2025–present) have them. Adding dates improves the ordering.
- **Clean Up Robot:** the old site called its PDF the "full project report", but the file is `CPRE_2880_Final_Project_Proposal_Group_A5-1.pdf`. It's labelled "Final project proposal"; relabel it if it's really the report.
- **GPA lines** were carried over. Remove them in `content/about.js` if you'd rather not show them.

The phone number is gone: you removed it from the old site in `deec242`, so the new site doesn't include it at all.

**Removed at your request:** Early Software Projects, and its five screenshots from `images/screenshots/` (still in git history).

**Unused but preserved:** `public/images/institutions/*` (school and lab logos), `public/images/site/Website_Footer.png`, and `public/generated-icon.png`.
