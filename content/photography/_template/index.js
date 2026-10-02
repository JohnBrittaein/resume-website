// TEMPLATE: folders starting with "_" are ignored by the build.
//
// A photography project is a folder:
//
//   content/photography/some-band-at-some-venue/
//     index.js        <- this file (metadata)
//     photos/         <- web-sized images, created by `npm run photos:import`
//     photos.json     <- per-photo alt text / captions, created by the importer
//
// The folder name becomes the URL: /photography/some-band-at-some-venue/

export default {
  title: "Some Band at Some Venue",
  category: "concerts", // concerts | skate | events | documentary | portraits | personal (see content/site.js)
  date: "2026-09-14", // "2026", "2026-09", or "2026-09-14"
  location: "City, State",
  description: "A sentence or two about the night. Links work: [Instagram](https://instagram.com/…).",

  // Optional
  featured: true, // show on the homepage
  cover: "DSC01234", // which photo is the cover (file name without extension); defaults to the first
  credits: [{ role: "Photography", name: "John Brittain" }],
  links: [{ label: "Band on Instagram", url: "https://instagram.com/…" }],
  inquire: true, // show the "Book / Inquire" call-to-action (default true)
};
