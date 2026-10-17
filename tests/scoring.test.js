import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { englishQuestions, questions } from '../src/questions.js?v=2026-10-25';
import { archetypes, chances, countHabits, getResult } from '../src/scoring.js?v=2026-10-25';
import { cleanName, fillTokens, findParty, parties, personalWords } from '../src/parties.js?v=2026-10-25';
import { SHARE_REAL_PARTIES, cardKicker, personalResult, shareFlavour } from '../src/personal.js?v=2026-10-25';
import { MIN_TOTAL_FOR_CHART, SLICE_ORDER, percentages } from '../src/stats.js?v=2026-10-25';
import { EVENTS, campaignUrl, cleanEvent } from '../src/analytics.js?v=2026-10-25';

const habits = Object.keys(archetypes);
const allAnswerSets = function* () {
  for (let n = 0; n < 4 ** questions.length; n += 1) {
    let value = n;
    yield questions.map(() => { const answer = value % 4; value = Math.floor(value / 4); return answer; });
  }
};

// ---- Structure ----
assert.equal(questions.length, 7);
assert.equal(englishQuestions.length, questions.length);
for (const question of questions) {
  assert.equal(question.options.length, 4);
  question.options.forEach((option) => assert.ok(habits.includes(option.habit), `Unknown habit: ${option.habit}`));
  assert.equal(new Set(question.options.map((option) => option.habit)).size, 4, `Repeated habit in: ${question.prompt}`);
}
englishQuestions.forEach((question, index) => {
  assert.deepEqual(question.options.map((option) => option.habit), questions[index].options.map((option) => option.habit), 'English must map to the same habits');
  question.options.forEach((option) => assert.ok(option.text.length > 0));
});

// ---- Fair opportunity: every habit is offered 4 or 5 times ----
for (const habit of habits) assert.ok(chances[habit] >= 4 && chances[habit] <= 5, `${habit} offered ${chances[habit]} times`);

// ---- Each habit has exactly one signature answer, each on a different question ----
const signatures = questions.flatMap((question, index) => question.options.filter((option) => option.signature).map((option) => ({ habit: option.habit, index })));
assert.deepEqual(signatures.map((s) => s.habit).sort(), [...habits].sort(), 'One signature per habit');
assert.equal(new Set(signatures.map((s) => s.index)).size, habits.length, 'Signatures on different questions');

// ---- Persona checks: deliberately built answer patterns must give the expected result ----
// Option order per question (A–D):
// Q1 andhbhakt, chamcha, factChecker*, spectator      Q2 andhbhakt, chamcha*, independent, manifesto
// Q3 andhbhakt*, chamcha, independent, spectator      Q4 andhbhakt, manifesto*, factChecker, spectator
// Q5 chamcha, manifesto, spectator*, factChecker      Q6 andhbhakt, factChecker, independent, manifesto
// Q7 independent*, factChecker, chamcha, manifesto
const personas = {
  'true believer (mostly blind trust, a little deflection)': { answers: [0, 1, 0, 0, 2, 0, 2], expect: 'andhbhakt' },
  'deflector (knows, but always "what about them")': { answers: [1, 1, 1, 0, 0, 3, 2], expect: 'chamcha' },
  'believer who sometimes deflects stays Andhbhakt': { answers: [0, 0, 0, 0, 0, 0, 2], expect: 'andhbhakt' },
  'deflector who sometimes trusts stays Chamcha': { answers: [1, 1, 1, 0, 0, 1, 2], expect: 'chamcha' },
  'source-checker': { answers: [2, 2, 2, 2, 3, 1, 1], expect: 'factChecker' },
  'popcorn watcher': { answers: [3, 3, 3, 3, 2, 3, 3], expect: 'spectator' },
  'promise tracker': { answers: [2, 3, 2, 1, 1, 3, 3], expect: 'manifesto' },
  'same-rules-for-all': { answers: [2, 2, 2, 2, 3, 2, 0], expect: 'independent' },
  'sensible but credit-giving': { answers: [2, 2, 2, 1, 1, 2, 0], expect: 'independent' },
};
for (const [name, { answers, expect }] of Object.entries(personas)) {
  assert.equal(getResult(answers).archetype.id, expect, `Persona "${name}" should be ${expect}`);
}

// Tie-break uses the signature answer: 2 andhbhakt (incl. its signature Q3) vs 2 chamcha (no signature) → andhbhakt.
const tie = getResult([1, 0, 0, 2, 0, 2, 3]);
assert.equal(tie.counts.andhbhakt, 2); assert.equal(tie.counts.chamcha, 2);
assert.equal(tie.archetype.id, 'andhbhakt');

// ---- Whole answer space: every result reachable and none dominant or rare ----
const tally = Object.fromEntries(habits.map((habit) => [habit, 0]));
let total = 0;
for (const answers of allAnswerSets()) { tally[getResult(answers).archetype.id] += 1; total += 1; }
// Frozen fingerprint of the result for all 16,384 answer sets. If this fails, scoring behaviour changed.
// Only update the value on purpose, after deciding to change how results are calculated.
const fingerprint = createHash('sha256').update([...allAnswerSets()].map((answers) => getResult(answers).archetype.id).join(',')).digest('hex').slice(0, 16);
assert.equal(fingerprint, '28b87443a9263ce7', 'Scoring results changed for some answer sets');
for (const habit of habits) {
  const share = tally[habit] / total;
  assert.ok(share >= 0.12 && share <= 0.22, `${habit} gets ${(share * 100).toFixed(1)}% of random answer sets`);
}

// ---- Copy rules ----
const copy = JSON.stringify({ questions, englishQuestions, archetypes });
for (const banned of ['BJP', 'Congress', 'AAP', 'IT Cell', 'High Command', 'Modi', 'Gandhi', 'Kejriwal', '🪷', '✋', '🧹']) {
  assert.ok(!copy.includes(banned), `Copy should not contain "${banned}"`);
}
for (const archetype of Object.values(archetypes)) {
  assert.ok(archetype.description.length <= 75, `${archetype.id} roast is too long for the share card`);
}

// ---- Cache versioning: every ?v= tag in the site must match ----
const files = ['index.html', 'about.html', 'privacy.html', 'terms.html', 'contact.html', 'src/app.js', 'src/scoring.js', 'src/parties.js', 'src/personal.js', 'src/stats.js', 'src/analytics.js', 'src/nav.js', 'tests/scoring.test.js'];
const versions = new Set(files.flatMap((file) => [...readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').matchAll(/\?v=([\w.-]+)/g)].map((m) => m[1])));
assert.equal(versions.size, 1, `All ?v= tags must match, found: ${[...versions].join(', ')}`);

// ---- Public URL ----
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(app.includes("SITE_URL = 'https://andhbhaktyachamcha.in'"));
assert.ok(!/github\.io/.test(app + index), 'No github.io links in the app or page head');

// ---- Party preference: personalises wording only ----
assert.ok(parties.length >= 15, 'Major parties listed');
assert.equal(new Set(parties.map((p) => p.id)).size, parties.length, 'Unique party ids');
parties.forEach((p) => { assert.ok(p.short && p.name); assert.ok(p.leaders.length <= 3); });
const allQuestionText = (list) => list.flatMap((q) => [q.prompt, ...q.options.map((o) => o.text)]);
const tokenPattern = /\{(party|Party|leader|Leader)\}/;
// Every placeholder resolves, for every party/leader choice and with no choice, in both languages.
const preferences = [null, { partyId: 'secret' }, { partyId: 'nota' }, { partyId: 'other' }, ...parties.flatMap((p) => [{ partyId: p.id, leader: null }, ...p.leaders.map((leader) => ({ partyId: p.id, leader }))])];
for (const [lang, list] of [[0, questions], [1, englishQuestions]]) {
  for (const preference of preferences) {
    const words = personalWords(preference, lang);
    for (const text of allQuestionText(list)) {
      const filled = fillTokens(text, words);
      assert.ok(!/[{}]/.test(filled), `Unfilled placeholder: ${filled}`);
    }
  }
}
// Placeholders are actually used, so the picker matters.
assert.ok(allQuestionText(questions).some((text) => tokenPattern.test(text)));
// Generic fallback wording reads naturally.
assert.equal(fillTokens('{Leader} ne bola hai', personalWords(null, 0)), 'Tumhare favourite leader ne bola hai');
assert.equal(fillTokens('{party} haar gayi', personalWords({ partyId: 'bjp', leader: null }, 0)), 'BJP haar gayi');
assert.equal(fillTokens('{leader} ki galti', personalWords({ partyId: 'inc', leader: 'Rahul Gandhi' }, 0)), 'Rahul Gandhi ki galti');
// A leader from another party is ignored only if the party is missing.
assert.equal(personalWords({ partyId: 'nota', leader: 'X' }, 0).leader, 'tumhare favourite leader');
assert.equal(findParty('nope'), null);
// "Apni party banao": any party name and any leader name flow into the questions.
const custom = { partyId: 'custom', leader: 'Pratik', custom: { party: 'Chai Pe Charcha Party', leader: 'Pratik', symbol: '☕' } };
assert.equal(fillTokens('Maan lo, {party} haar gayi. {Leader} ne bola', personalWords(custom, 0)), 'Maan lo, Chai Pe Charcha Party haar gayi. Pratik ne bola');
assert.equal(personalWords({ ...custom, leader: null }, 0).leader, 'tumhare favourite leader');
assert.equal(findParty('custom', custom).symbol, '☕');
assert.equal(cleanName('  <b>Raju</b>   bhai  '), 'bRaju/b bhai');
assert.equal(cleanName('x'.repeat(50)).length, 30);
// Results and share copy never mention any listed party or leader.
const resultCopy = JSON.stringify(archetypes);
for (const p of parties) {
  for (const word of [p.short, p.name, ...p.leaders]) assert.ok(!resultCopy.includes(word), `Result copy mentions ${word}`);
}
// The app never writes the preference to storage, the URL or analytics.
const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
for (const forbidden of ['localStorage', 'sessionStorage', 'dataLayer', 'history.pushState', 'location.hash', 'document.cookie']) {
  assert.ok(!appSource.includes(forbidden), `app.js must not use ${forbidden}`);
}
// Analytics: exactly one gtag call in the whole app (inside analytics.js track()), never in app.js.
const analyticsSource = readFileSync(new URL('../src/analytics.js', import.meta.url), 'utf8');
assert.equal(appSource.split('gtag').length - 1, 0, 'app.js must not call gtag directly');
assert.equal(analyticsSource.split('gtag?.(').length - 1, 1, 'gtag only inside track()');
const trackCalls = [...appSource.matchAll(/track(?:Once)?\(([^;]*?)\)(?:;|\)|\s)/g)].map((m) => m[1]).filter((args) => !args.startsWith('name') && !args.startsWith('key'));
for (const args of trackCalls) {
  for (const word of ['preference', 'answers', 'archetype', 'leader', 'party.', 'custom.', 'counts', 'result.']) {
    assert.ok(!args.includes(word), `track() must not send ${word}: track(${args})`);
  }
}
assert.ok(trackCalls.length >= 10, 'Counting is wired up');
// The whitelist itself: only fixed words or question numbers, never free text.
for (const [name, params] of Object.entries(EVENTS)) {
  for (const values of Object.values(params)) values.forEach((value) => assert.ok(typeof value === 'number' || /^[a-z_]+$/.test(value), `${name}: odd value ${value}`));
}
assert.equal(cleanEvent('page_secret', {}), null, 'Unknown events are dropped');
assert.deepEqual(cleanEvent('team_pick', { path: 'listed', party: 'BJP', team: 'bjp' }), { path: 'listed' }, 'Extra params are dropped');
assert.deepEqual(cleanEvent('team_pick', { path: 'BJP' }), {}, 'Unlisted values are dropped');
assert.deepEqual(cleanEvent('quiz_progress', { question_number: 3, answer: 2 }), { question_number: 3 });
assert.deepEqual(cleanEvent('quiz_progress', { question_number: 9 }), {});
assert.deepEqual(cleanEvent('share', { method: 'whatsapp' }), {}, 'A tap on wa.me is never counted as a confirmed share');
assert.deepEqual(cleanEvent('quiz_complete', { result: 'chamcha' }), {}, 'Result type never reaches analytics');
for (const p of parties) for (const word of [p.id, p.short, ...p.leaders]) assert.ok(!JSON.stringify(EVENTS).includes(`"${word}"`), `Analytics whitelist mentions ${word}`);
// Campaign links: fixed tags only, nothing else can be added.
assert.equal(campaignUrl('https://andhbhaktyachamcha.in', 'whatsapp', 'quiz_challenge'), 'https://andhbhaktyachamcha.in/?utm_source=whatsapp&utm_medium=social&utm_campaign=quiz_challenge');
assert.equal(campaignUrl('https://andhbhaktyachamcha.in', 'Pratik', 'quiz_challenge'), 'https://andhbhaktyachamcha.in', 'Unknown sources are ignored');
assert.ok(!/campaignUrl\([^)]*(preference|answers|leader|custom|archetype)/.test(appSource), 'Campaign links never use quiz data');
// Browser history: only screen names, never data, and the address never changes.
const navSource = readFileSync(new URL('../src/nav.js', import.meta.url), 'utf8');
assert.equal(navSource.match(/history\.pushState\(/g).length, 1);
assert.ok(/history\.pushState\(\{ screen \}, ''\)/.test(navSource), 'pushState stores only the screen name, no URL');
assert.ok(/history\.replaceState\(\{ screen \}, ''\)/.test(navSource), 'replaceState stores only the screen name, no URL');
assert.ok(!/location|localStorage|sessionStorage/.test(navSource.replace(/\/\/.*$/gm, '')));
assert.ok(!/history\.(push|replace)State/.test(appSource), 'app.js changes history only through nav.js');
const { SCREEN_PATTERN } = await import('../src/nav.js?v=2026-10-25');
for (const ok of ['landing', 'party', 'leader', 'custom', 'quiz-0', 'quiz-6', 'result']) assert.ok(SCREEN_PATTERN.test(ok));
for (const bad of ['quiz-7', 'bjp', 'party-bjp', 'result-chamcha', '']) assert.ok(!SCREEN_PATTERN.test(bad), `Screen "${bad}" must be rejected`);
// Share wording never claims a save or share that the browser didn't confirm.
assert.ok(!/save ho gayi|Image saved/i.test(appSource), 'No "image saved" claims');

// ---- Personalised results ----
for (const id of Object.keys(archetypes)) {
  for (const preference of preferences.concat([custom, { ...custom, leader: null }])) {
    for (const lang of [0, 1]) {
      const personal = personalResult(id, preference, lang);
      if (!personal) continue;
      for (const text of [personal.line, personal.extra || '']) assert.ok(!/[{}]/.test(text), `Unfilled: ${text}`);
    }
  }
}
assert.equal(personalResult('andhbhakt', null, 0), null, 'No block without a pick');
assert.equal(personalResult('andhbhakt', { partyId: 'secret' }, 0), null);
assert.equal(personalResult('andhbhakt', { partyId: 'nota' }, 0), null);
assert.ok(personalResult('chamcha', { partyId: 'bjp', leader: 'Amit Shah' }, 0).line.includes('Amit Shah'));
assert.ok(personalResult('spectator', custom, 0).extra.includes('Pratik'));
// Real parties never reach the share card or share text (unless the owner flips SHARE_REAL_PARTIES).
assert.equal(SHARE_REAL_PARTIES, false);
for (const p of parties) {
  assert.equal(cardKicker({ partyId: p.id, leader: p.leaders[0] || null }, 0), null);
  assert.equal(shareFlavour({ partyId: p.id, leader: p.leaders[0] || null }, 0), '');
}
assert.equal(cardKicker({ partyId: 'other' }, 0), null);
assert.equal(cardKicker(custom, 0), '☕ Chai Pe Charcha Party supporter ka verdict:');
assert.ok(shareFlavour(custom, 0).includes('supreme leader: Pratik'));

// ---- Public result-type counter ----
assert.deepEqual([...SLICE_ORDER].sort(), [...habits].sort(), 'Chart covers every result type');
assert.ok(MIN_TOTAL_FOR_CHART >= 10, 'Chart stays hidden until at least 10 results');
assert.deepEqual(percentages({ andhbhakt: 1, chamcha: 1, independent: 2, spectator: 0, factChecker: 0, manifesto: 0 }, 4).independent, 50);
assert.equal(percentages(Object.fromEntries(habits.map((h) => [h, 0])), 0).chamcha, 0);
const statsSource = readFileSync(new URL('../src/stats.js', import.meta.url), 'utf8');
for (const word of ['preference', 'party', 'leader', 'answers', 'custom', 'localStorage']) {
  assert.ok(!new RegExp(`\\b${word}\\b`).test(statsSource.replace(/\/\/.*$/gm, '')), `stats.js must not touch ${word}`);
}
assert.ok(/recordResult\(archetype\.id\)/.test(appSource), 'Only the result type is counted');

// ---- English mode covers every result ----
for (const archetype of Object.values(archetypes)) {
  for (const field of ['subtitle', 'description', 'verdict', 'superpower', 'weakness']) {
    assert.ok(archetype.en?.[field], `${archetype.id} needs English ${field}`);
  }
  assert.ok(archetype.en.description.length <= 75, `${archetype.id} English roast too long for the card`);
}
const englishCopy = JSON.stringify(Object.values(archetypes).map((a) => a.en));
for (const banned of ['BJP', 'Congress', 'AAP', 'IT Cell', 'High Command', 'Modi', 'Gandhi', 'Kejriwal']) assert.ok(!englishCopy.includes(banned));

assert.throws(() => countHabits([]), /complete set/);
assert.throws(() => countHabits(Array(7).fill(4)), /complete set/);

console.log('Scoring tests passed.');
console.log(Object.entries(tally).map(([habit, n]) => `${habit} ${(100 * n / total).toFixed(1)}%`).join(' · '));
