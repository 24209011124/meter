// Public, anonymous tally of result TYPES for the home-page chart ("Ab tak ka scene").
// Uses Abacus (https://abacus.jasoncameron.dev), a free counting service that needs no account.
//
// What is sent: only "one more <result type>" when someone finishes the quiz. Never answers, party, leader
// or names. Like any website request, Abacus sees the visitor's IP address (disclosed on privacy.html).
//
// Limits to know: no uptime guarantee; anyone who finds the URL could inflate a counter; counters expire
// after 6 months with zero visits. If the service fails, the chart simply hides. To move to your own
// backend later, only change BASE / the two fetch calls below.

const BASE = 'https://abacus.jasoncameron.dev';
const NAMESPACE = 'andhbhaktyachamcha.in';
const TIMEOUT_MS = 4000;

// Show the chart only after this many recorded results, so a handful of plays (including the owner's own
// test runs) can't make a misleading pie. Below this the home page shows a "warm-up" note instead.
// Counts are all-time finished quizzes, not unique people.
export const MIN_TOTAL_FOR_CHART = 50;

// Fixed slice order (never sorted by size): chosen so neighbouring colours stay distinguishable,
// including for colour-blind readers, on the dark chart panel.
export const SLICE_ORDER = ['andhbhakt', 'chamcha', 'independent', 'spectator', 'factChecker', 'manifesto'];

const keyFor = (id) => `result-${id}`;

async function request(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE}${path}`, { signal: controller.signal, cache: 'no-store' });
    if (response.status === 404) return 0; // counter not created yet
    if (!response.ok) throw new Error(`Counter error ${response.status}`);
    const data = await response.json();
    return Number.isFinite(data.value) ? data.value : 0;
  } finally {
    clearTimeout(timer);
  }
}

// { counts: { andhbhakt: n, ... }, total } — throws if the service is unreachable.
export async function fetchStats() {
  const values = await Promise.all(SLICE_ORDER.map((id) => request(`/get/${NAMESPACE}/${keyFor(id)}`)));
  const counts = Object.fromEntries(SLICE_ORDER.map((id, index) => [id, values[index]]));
  return { counts, total: values.reduce((sum, value) => sum + value, 0) };
}

let recordedThisVisit = false;

// Adds this person's result type once per page visit (replays don't count twice) and returns fresh stats.
export async function recordResult(id) {
  if (!SLICE_ORDER.includes(id)) throw new Error('Unknown result type');
  if (!recordedThisVisit) {
    recordedThisVisit = true;
    await request(`/hit/${NAMESPACE}/${keyFor(id)}`);
  }
  return fetchStats();
}

export const percentages = (counts, total) => Object.fromEntries(SLICE_ORDER.map((id) => [id, total ? Math.round((counts[id] / total) * 100) : 0]));
