# Tessa WebDocs

The public landing page and documentation site for [Tessa](https://github.com/Keychrom/Tessa), built with Astro, Starlight, and Svelte.

```sh
npm install
npm run sync:docs
npm run dev
```

- `npm run build` runs `astro check` and produces `dist/`.
- `npm run sync:docs` imports the Markdown docs from a sibling `../Tessa` checkout (override with `TESSA_REPO`).
- `npm run check:links` validates internal links after a build.
- `npm run assets` regenerates the social card and touch icon.

The site is published at <https://keychrom.github.io/> from the `Keychrom.github.io` repository using GitHub Actions.
