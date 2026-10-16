// The ONLY way this site talks to Google Analytics (the G-ZPDQ887N11 tag in index.html).
//
// Every event name and every parameter value is listed below. Anything not on the list is dropped
// before it reaches gtag, so answers, results, party or leader picks, custom names and free text
// can never be sent by accident. tests/scoring.test.js checks this.
//
//   cta_click        a "start" button on the home page was tapped     cta_location: hero | stats | bottom | teaser
//   quiz_start       Question 1 appeared (once per quiz run)
//   team_pick        how the player got past the party screen          path: skip | custom | listed
//   quiz_progress    a question was answered for the first time        question_number: 1–7
//   quiz_complete    the result appeared (once per quiz run)
//   share_click      a share/download button was tapped                method: see SHARE_METHODS
//   share            the browser CONFIRMED a share or copy succeeded   method: share_sheet | story_image | copy
//   instagram_click  the Instagram link was tapped

export const SHARE_METHODS = ['whatsapp', 'share_sheet', 'story_image', 'download_story', 'download_feed', 'copy'];

export const EVENTS = {
  cta_click: { cta_location: ['hero', 'stats', 'bottom', 'teaser'] },
  quiz_start: {},
  team_pick: { path: ['skip', 'custom', 'listed'] },
  quiz_progress: { question_number: [1, 2, 3, 4, 5, 6, 7] },
  quiz_complete: {},
  share_click: { method: SHARE_METHODS },
  share: { method: ['share_sheet', 'story_image', 'copy'] },
  instagram_click: {},
};

// Returns the exact params that would be sent, or null if the event is not allowed. Exported for tests.
export function cleanEvent(name, params = {}) {
  const allowed = EVENTS[name];
  if (!allowed) return null;
  const clean = {};
  for (const [key, values] of Object.entries(allowed)) {
    if (values.includes(params[key])) clean[key] = params[key];
  }
  return clean;
}

export function track(name, params = {}) {
  const clean = cleanEvent(name, params);
  if (!clean) return;
  try { globalThis.gtag?.('event', name, clean); } catch { /* analytics blocked or not loaded */ }
}

// Campaign tags for links people share, so Google Analytics can tell WhatsApp visits apart from "direct".
// Only fixed words go in here. Never anything from the quiz.
export const SHARE_SOURCES = ['whatsapp', 'share_sheet', 'copy_link'];
export const SHARE_CAMPAIGNS = ['quiz_challenge', 'result_share'];
export function campaignUrl(base, source, campaign) {
  if (!SHARE_SOURCES.includes(source) || !SHARE_CAMPAIGNS.includes(campaign)) return base;
  const url = new URL(base);
  url.search = new URLSearchParams({ utm_source: source, utm_medium: 'social', utm_campaign: campaign }).toString();
  return url.toString();
}
