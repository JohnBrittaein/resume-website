# John Brittain: photography / music / machines

Source for my personal site: photography, music, video, engineering, and whatever else I make.

It's a static site: hand-written HTML/CSS/JS templates, content kept in plain JavaScript files, and a small Node build script. The only dependency is [`sharp`](https://sharp.pixelplumbing.com/), for responsive images. The output runs on any static host.

```sh
npm install
npm run dev              # preview at http://localhost:8080, rebuilds on save
npm run build            # production build → dist/
npm run check            # broken links, missing alt text, titles, etc. (after a build)
npm run photos:import -- "<folder of selected photos>" --category concerts
```

## Layout

```
content/          ← everything you edit to add work (see docs/CONTENT.md)
  site.js           name, socials, homepage hero, categories, form backend
  about.js          bio, education, experience, skills, writing
  photography/      one folder per shoot (photos + index.js + photos.json)
  music/  art/  video/  work/
public/           ← copied as-is: images/, audiofiles/, documents/, favicon, headers
src/
  layout.mjs        <head>, navigation, footer
  pages/            one module per page type
  components/       media (images, galleries, video, audio), UI, forms
  styles/           tokens → base → layout → components → pages
  js/               progressive enhancement: menu, lightbox, filters, video, audio, forms
scripts/
  build.mjs         builds dist/
  lib/              content loader, image pipeline, URL helpers, HTML escaping
  import-photos.mjs camera originals → web masters (resized, metadata/GPS stripped)
  dev.mjs  check.mjs
docs/
  CONTENT.md        how to add a photography shoot, music, video, or an engineering project
  DEPLOY.md         GitHub Pages, Cloudflare Pages, custom domain + DNS
  MIGRATION.md      what moved from the old résumé site, and what still needs content
```

The look is the old site's retro style: Inconsolata, a phosphor glow on headings, and signal yellow, on one solid color per section (with a blueprint grid for Work). Tokens are in `src/styles/tokens.css`.

## Principles

- **Photographs stay light.** Every image is served as WebP at 480–2400 px with `srcset`, lazy-loaded, with its width and height set (no layout shift) and a placeholder color while it loads. Full-size files load only in the full-screen viewer. Camera originals never go in git.
- **Works without JavaScript.** Galleries link to the full images, audio uses the native player, videos link to YouTube, and forms fall back to email. JavaScript only improves each of these.
- **Third-party players load late.** YouTube loads on click (from `youtube-nocookie.com`), Spotify players load as they scroll into view, and audio files load on play.
- **Honest content.** Dashed `[ADD …]` markers show what's missing. Turn them off with `showPlaceholders: false` in `content/site.js`.
