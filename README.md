# Bhakt Ya Chamcha?

Local-first static MVP for a humorous political reasoning quiz.

## Run locally

```bash
npm test
npm run serve
```

Then open `http://localhost:4173`.

## Public preview

The current friend-testing deployment is published on GitHub Pages at `https://24209011124.github.io/meter/`. Pushes to `feature/bhakt-ya-chamcha` trigger the deployment workflow in `.github/workflows/deploy-pages.yml`.

## Structure

- `index.html` and `styles.css`: landing page and visual system (sticker-and-stamp style; brand colours rani pink, haldi yellow, jamun purple, plus one colour per result).
- `assets/fonts/`: self-hosted Latin subsets of Yatra One (headlines) and Hind (body), with their OFL licences.
- `og-image.png`: 1200×630 link-preview image for WhatsApp and other apps.
- `src/questions.js`: quiz copy.
- `src/scoring.js`: explicit scoring map, thresholds, and archetypes.
- `src/app.js`: quiz navigation, result view, sharing, and result-card export.
- `tests/scoring.test.js`: deterministic scoring tests.
- `about.html`, `privacy.html`, `terms.html`, `contact.html`: launch-draft information pages.

The public preview URL is configured in `src/app.js` and `index.html` so share links and social previews do not use a local or Codespaces URL. Analytics and advertising are intentionally disabled.

## Before launch

Add an owner-approved genuine contact method, review the legal pages against the final hosting and advertising integrations, configure the production canonical URL and social image, and run the full browser/accessibility checks.