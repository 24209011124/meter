import assert from 'node:assert/strict';
import { archetypes, getResult, scoreAnswers, scoringMap } from '../src/scoring.js';

const all = (value) => Array.from({ length: 10 }, () => value);

assert.equal(scoringMap.length, 10);
assert.equal(scoringMap.every((question) => question.options.length === 4), true);
assert.deepEqual(scoreAnswers(all(0)), { loyaltyBias: 5, criticalEvaluation: 20, engagementStyle: 24 });
assert.equal(getResult(all(0)).archetype.id, 'independent');
assert.equal(getResult([0, 0, 0, 1, 1, 1, 1, 1, 1, 1]).archetype.id, 'andhbhakt');
assert.equal(getResult([0, 0, 0, 0, 0, 0, 0, 1, 0, 0]).archetype.id, 'chamcha');
assert.equal(getResult([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]).archetype.id, 'factChecker');
assert.equal(getResult([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]).archetype.id, 'independent');
assert.equal(getResult([0, 1, 0, 0, 2, 3, 0, 2, 0, 0]).archetype.id, 'manifesto');
assert.equal(getResult([0, 0, 0, 0, 1, 0, 3, 3, 2, 0]).archetype.id, 'spectator');
assert.equal(getResult([0, 1, 0, 0, 2, 3, 0, 2, 0, 0]).archetype, archetypes.manifesto);
assert.throws(() => scoreAnswers([]), /complete set/);
assert.throws(() => scoreAnswers([...all(0).slice(0, 9), 4]), /complete set/);

console.log('Scoring tests passed.');