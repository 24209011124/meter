import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { englishQuestions, questions } from '../src/questions.js?v=2026-10-15';
import { archetypes, chances, countHabits, getResult } from '../src/scoring.js?v=2026-10-15';

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
const files = ['index.html', 'about.html', 'privacy.html', 'terms.html', 'contact.html', 'src/app.js', 'src/scoring.js', 'tests/scoring.test.js'];
const versions = new Set(files.flatMap((file) => [...readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').matchAll(/\?v=([\w.-]+)/g)].map((m) => m[1])));
assert.equal(versions.size, 1, `All ?v= tags must match, found: ${[...versions].join(', ')}`);

// ---- Public URL ----
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.ok(app.includes("SITE_URL = 'https://andhbhaktyachamcha.in'"));
assert.ok(!/github\.io/.test(app + index), 'No github.io links in the app or page head');

assert.throws(() => countHabits([]), /complete set/);
assert.throws(() => countHabits(Array(7).fill(4)), /complete set/);

console.log('Scoring tests passed.');
console.log(Object.entries(tally).map(([habit, n]) => `${habit} ${(100 * n / total).toFixed(1)}%`).join(' · '));
