# Andhbhakt Ya Chamcha?

Local-first static MVP for a humorous political reasoning quiz.

## Run locally

```bash
npm test
npm run serve
```

Then open `http://localhost:4173`.

## Live site

Published at `https://andhbhaktyachamcha.in` via GitHub Pages. Pushes to `feature/bhakt-ya-chamcha` trigger `.github/workflows/deploy-pages.yml`.

## How results are decided

- Every option maps to one habit, and its wording must describe that habit (see the header of `src/questions.js`). Andhbhakt = genuinely believes the leader can do no wrong; Chamcha = knows their side may be wrong but makes excuses or points at the other side.
- Habits are offered 4 or 5 times each, so the score is the share of chances taken (`2 / 4 mauke` beats `2 / 5 mauke`).
- Ties go to the habit whose single "signature" answer was chosen, then to the most recent pick.
- `npm test` checks fair opportunity, persona answer patterns, that every result gets 12–22% of all possible answer sets, banned party words, roast length, and matching cache versions.

## Cache versioning

When you change any file under `src/` or `styles.css`, bump the `?v=` value everywhere it appears (index and legal pages, `src/app.js`, `src/scoring.js`, the test). `npm test` fails if they do not match.

## Structure

- `index.html` and `styles.css`: landing page and visual system (sticker-and-stamp style; brand colours rani pink, haldi yellow, jamun purple, plus one colour per result).
- `assets/fonts/`: self-hosted Latin subsets of Yatra One (headlines) and Hind (body), with their OFL licences.
- `og-image.png`: 1200×630 link-preview image for WhatsApp and other apps.
- `src/questions.js`: quiz copy.
- `src/scoring.js`: archetypes, share-of-chances scoring and tie-break rules.
- `src/app.js`: quiz navigation, result view, sharing, and result-card export.
- `tests/scoring.test.js`: deterministic scoring tests.
- `about.html`, `privacy.html`, `terms.html`, `contact.html`: launch-draft information pages.

The public URL is set in `SITE_URL` in `src/app.js` and in the canonical/og tags in `index.html`. Analytics and advertising are intentionally disabled.

## Before launch

Add an owner-approved genuine contact method, review the legal pages against the final hosting and advertising integrations, configure the production canonical URL and social image, and run the full browser/accessibility checks.