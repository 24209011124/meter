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
- `src/questions.js`: quiz copy, with `{party}` / `{leader}` placeholders and an illustrated scene per question.
- `src/personal.js`: result lines that use the picked party/leader. Real party names stay off share cards and share text (`SHARE_REAL_PARTIES = false`); invented "Apni party banao" parties do appear there.
- `src/stats.js`: anonymous public counter of result types (Abacus, no account) for the home-page "Ab tak ka scene" chart. Chart appears after `MIN_TOTAL_FOR_CHART` (10) real results; hides itself if the service is down.
- `src/parties.js`: party and leader list for the optional pre-quiz picker (emoji stand-ins, not official logos). Review before each election season. The pick only changes question wording: it is never scored, stored, sent to analytics or shown on results.
- `src/scoring.js`: archetypes, share-of-chances scoring and tie-break rules.
- `src/app.js`: quiz navigation, result view, sharing, and result-card export.
- `tests/scoring.test.js`: deterministic scoring tests.
- `about.html`, `privacy.html`, `terms.html`, `contact.html`: launch-draft information pages.

The header has a Hinglish/English switch on every screen; English text lives in `t()` second arguments, `englishQuestions` and `archetype.en`.

The public URL is set in `SITE_URL` in `src/app.js` and in the canonical/og tags in `index.html`. Google Analytics counts only five events via `track()` in `src/app.js`: quiz_start, team_pick (real_party / custom / no_party), quiz_complete, share (method) and instagram_click. Answers, results, party and leader are never sent; tests enforce this. See them in GA under Reports > Engagement > Events (they can take up to a day to appear).

## Before launch

Add an owner-approved genuine contact method, review the legal pages against the final hosting and advertising integrations, configure the production canonical URL and social image, and run the full browser/accessibility checks.