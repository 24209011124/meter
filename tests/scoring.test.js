import assert from 'node:assert/strict';
import { questions } from '../src/questions.js';
import { archetypes, countHabits, getResult, tieBreakOrder } from '../src/scoring.js';

const habits = Object.keys(archetypes);

// Structure: 10 questions, 4 options each, every option tagged with a known habit,
// and no question offers the same habit twice.
assert.equal(questions.length, 10);
for (const question of questions) {
  assert.equal(question.options.length, 4);
  question.options.forEach((option) => assert.ok(habits.includes(option.habit), `Unknown habit: ${option.habit}`));
  assert.equal(new Set(question.options.map((option) => option.habit)).size, 4, `Repeated habit in: ${question.prompt}`);
}

// Balance: every habit is offered 6 or 7 times, so no result is structurally rare.
const offered = Object.fromEntries(habits.map((habit) => [habit, 0]));
questions.forEach((question) => question.options.forEach((option) => { offered[option.habit] += 1; }));
for (const habit of habits) assert.ok(offered[habit] >= 6 && offered[habit] <= 7, `${habit} offered ${offered[habit]} times`);

// Every result is reachable: always choosing a habit (where offered) gives that habit.
for (const habit of habits) {
  const answers = questions.map((question) => Math.max(0, question.options.findIndex((option) => option.habit === habit)));
  assert.equal(getResult(answers).archetype.id, habit, `${habit} should be reachable`);
}

// Neutrality: no party names or party-symbol emojis anywhere in the copy.
const copy = JSON.stringify({ questions, archetypes });
for (const banned of ['BJP', 'Congress', 'AAP', 'IT Cell', 'High Command', '🪷', '✋', '🧹']) {
  assert.ok(!copy.includes(banned), `Copy should not contain "${banned}"`);
}

// Counts add up to 10, ties follow the documented order, and a runner-up is reported.
const mixed = getResult([2, 1, 0, 2, 2, 0, 0, 0, 0, 1]);
assert.equal(Object.values(mixed.counts).reduce((a, b) => a + b, 0), 10);
assert.equal(tieBreakOrder.length, habits.length);
assert.ok(mixed.runnerUp);

assert.throws(() => countHabits([]), /complete set/);
assert.throws(() => countHabits(Array(10).fill(4)), /complete set/);

console.log('Scoring tests passed.');
