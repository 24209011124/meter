# Bhakt Ya Chamcha?

Local-first static MVP for a humorous political reasoning quiz.

## Run locally

```bash
npm test
npm run serve
```

Then open `http://localhost:4173`.

## Structure

- `index.html` and `styles.css`: landing page and visual system (sticker-and-stamp style; brand colours rani pink, haldi yellow, jamun purple, plus one colour per result).
- `assets/fonts/`: self-hosted Latin subsets of Yatra One (headlines) and Hind (body), with their OFL licences.
- `og-image.png`: 1200×630 link-preview image for WhatsApp and other apps.
- `src/questions.js`: quiz copy.
- `src/scoring.js`: explicit scoring map, thresholds, and archetypes.
- `src/app.js`: quiz navigation, result view, sharing, and result-card export.
- `tests/scoring.test.js`: deterministic scoring tests.
- `about.html`, `privacy.html`, `terms.html`, `contact.html`: launch-draft information pages.

The canonical URL is currently derived from the browser origin. Before launch, set `SITE_URL` at the top of `src/app.js` and replace the relative `og:url` and `og:image` values in `index.html` with full `https://` addresses; WhatsApp only shows the preview image for absolute URLs. Analytics and advertising are intentionally disabled.

## Before launch

Add an owner-approved genuine contact method, review the legal pages against the final hosting and advertising integrations, configure the production canonical URL and social image, and run the full browser/accessibility checks.