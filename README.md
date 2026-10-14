# Bhakt Ya Chamcha?

Local-first static MVP for a humorous political reasoning quiz.

## Run locally

```bash
npm test
npm run serve
```

Then open `http://localhost:4173`.

## Structure

- `index.html` and `styles.css`: landing page and visual system.
- `src/questions.js`: quiz copy.
- `src/scoring.js`: explicit scoring map, thresholds, and archetypes.
- `src/app.js`: quiz navigation, result view, sharing, and result-card export.
- `tests/scoring.test.js`: deterministic scoring tests.
- `about.html`, `privacy.html`, `terms.html`, `contact.html`: launch-draft information pages.

The canonical URL is currently derived from the browser origin in `src/app.js`. Replace that central setting with the approved production domain before launch. Analytics and advertising are intentionally disabled.

## Before launch

Add an owner-approved genuine contact method, review the legal pages against the final hosting and advertising integrations, configure the production canonical URL and social image, and run the full browser/accessibility checks.