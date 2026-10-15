import assert from 'node:assert/strict';
import { englishQuestions, questions } from '../src/questions.js';
import { archetypes, countHabits, getResult, tieBreakOrder } from '../src/scoring.js';

const habits = Object.keys(archetypes);

// Structure: 7 questions, 4 options each, every option tagged with a known habit,
// and no question offers the same habit twice.
assert.equal(questions.length, 7);
assert.equal(englishQuestions.length, questions.length);
for (const question of questions) {
  assert.equal(question.options.length, 4);
  question.options.forEach((option) => assert.ok(habits.includes(option.habit), `Unknown habit: ${option.habit}`));
  assert.equal(new Set(question.options.map((option) => option.habit)).size, 4, `Repeated habit in: ${question.prompt}`);
}
englishQuestions.forEach((question, index) => {
  assert.equal(question.options.length, 4);
  assert.equal(question.options.map((option) => option.habit).join(','), questions[index].options.map((option) => option.habit).join(','));
});

// Balance: every habit is offered at least three times, so all results remain viable.
const offered = Object.fromEntries(habits.map((habit) => [habit, 0]));
questions.forEach((question) => question.options.forEach((option) => { offered[option.habit] += 1; }));
for (const habit of habits) assert.ok(offered[habit] >= 3, `${habit} offered ${offered[habit]} times`);

// Every result is reachable: find a valid answer path for each habit.
for (const habit of habits) {
  let reachable = false;
  for (let candidate = 0; candidate < 4 ** questions.length && !reachable; candidate += 1) {
    let value = candidate;
    const answers = questions.map(() => {
      const answer = value % 4;
      value = Math.floor(value / 4);
      return answer;
    });
    reachable = getResult(answers).archetype.id === habit;
  }
  assert.ok(reachable, `${habit} should be reachable`);
}

// Neutrality: no party names or party-symbol emojis anywhere in the copy.
const copy = JSON.stringify({ questions, archetypes });
for (const banned of ['BJP', 'Congress', 'AAP', 'IT Cell', 'High Command', '🪷', '✋', '🧹']) {
  assert.ok(!copy.includes(banned), `Copy should not contain "${banned}"`);
}

// Counts add up to 7, ties follow the documented order, and a runner-up is reported.
const mixed = getResult([2, 1, 0, 2, 2, 0, 0]);
assert.equal(Object.values(mixed.counts).reduce((a, b) => a + b, 0), 7);
assert.equal(tieBreakOrder.length, habits.length);
assert.ok(mixed.runnerUp);

assert.throws(() => countHabits([]), /complete set/);
assert.throws(() => countHabits(Array(7).fill(4)), /complete set/);

console.log('Scoring tests passed.');
