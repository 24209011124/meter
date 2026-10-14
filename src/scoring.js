import { questions } from './questions.js';

// "Bhakt" and "Chamcha" here are habits, not party labels. Either can show up in a fan of any side.
export const archetypes = {
  andhbhakt: {
    id: 'andhbhakt',
    emoji: '🙈',
    title: 'Andhbhakt Mode: ON',
    subtitle: 'Mera leader galat ho hi nahi sakta.',
    description: 'Leader ne bola matlab final. Doubt ka option syllabus mein nahi hai.',
    superpower: 'Loyalty ekdum solid. Mushkil time mein bhi saath nahi chhodte.',
    weakness: 'Leader ko bhi kabhi-kabhi galat maanna padta hai. Evidence ko bhi mic do.',
    verdict: 'Loyalty full volume par hai. Ab thoda volume sawaalon ka bhi badhao.',
  },
  chamcha: {
    id: 'chamcha',
    emoji: '🥄',
    title: 'Chamcha Mode: ON',
    subtitle: '"Unhone bhi toh kiya tha" ke brand ambassador.',
    description: 'Apni side ki har galti ka jawab: doosri side ki bigger galti.',
    superpower: 'Kisi bhi bahas mein counter-example 2 second mein ready.',
    weakness: 'Doosre ki galti se apni galti sahi nahi ho jaati.',
    verdict: 'Whataboutery mein PhD. Ab "same rules for all" wala elective bhi lo.',
  },
  factChecker: {
    id: 'factChecker',
    emoji: '🔎',
    title: 'Fact-Check Wala',
    subtitle: 'Source bhej, bhai!',
    description: 'Forward baad mein karna, source pehle bhejna.',
    superpower: 'Fake news tumhare saamne do minute nahi tikti.',
    weakness: 'Har family forward investigation nahi hai. Kabhi-kabhi bas good morning hai.',
    verdict: 'Tumhara trust button evidence se unlock hota hai.',
  },
  spectator: {
    id: 'spectator',
    emoji: '🍿',
    title: 'Political Spectator',
    subtitle: 'Debate ka popcorn investor.',
    description: 'Tum log ladte raho, main popcorn arrange karta hoon.',
    superpower: 'BP normal. Politics ko dil pe nahi lete.',
    weakness: 'Kuch issues tumhari life pe bhi asar daalte hain. Kabhi-kabhi dhyaan bhi do.',
    verdict: 'Vibes neutral hain. Kabhi-kabhi vote of attention bhi de do.',
  },
  manifesto: {
    id: 'manifesto',
    emoji: '📋',
    title: 'Manifesto Auditor',
    subtitle: 'Speech ho gayi. Ab delivery report dikhao.',
    description: 'Promises note kar liye. Ab kaam ka hisaab do.',
    superpower: 'Bhaashan se zyada kaam dekhte ho.',
    weakness: 'Har kaam ka result turant nahi dikhta. Context bhi dekhna padta hai.',
    verdict: 'Report card haath mein hai. Neta log, attendance lag rahi hai.',
  },
  independent: {
    id: 'independent',
    emoji: '🧠',
    title: 'Independent Thinker',
    subtitle: 'Dimaag ki sarkar independent hai.',
    description: 'Side koi bhi ho, rules sabke liye same.',
    superpower: 'Apni side ko bhi wahi sawaal poochte ho jo doosri side ko.',
    weakness: '"Main neutral hoon" bolna aasaan hai. Apne aap ko bhi check karte raho.',
    verdict: 'Party koi bhi ho, tumhara fact-checker duty par hai.',
  },
};

// Fixed listing order. Ties between habits are broken by the person's own answers
// (the tied habit picked most recently wins), not by this list.
export const tieBreakOrder = ['andhbhakt', 'chamcha', 'spectator', 'manifesto', 'factChecker', 'independent'];

export function countHabits(answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length || answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    throw new Error('A complete set of ten valid answers is required.');
  }
  const counts = Object.fromEntries(tieBreakOrder.map((habit) => [habit, 0]));
  answers.forEach((answer, index) => { counts[questions[index].options[answer].habit] += 1; });
  return counts;
}

export function lastPicked(answers) {
  const last = Object.fromEntries(tieBreakOrder.map((habit) => [habit, -1]));
  answers.forEach((answer, index) => { last[questions[index].options[answer].habit] = index; });
  return last;
}

export function rankHabits(counts, last = {}) {
  return [...tieBreakOrder].sort((a, b) => counts[b] - counts[a] || (last[b] ?? -1) - (last[a] ?? -1) || tieBreakOrder.indexOf(a) - tieBreakOrder.indexOf(b));
}

export function getResult(answers) {
  const counts = countHabits(answers);
  const last = lastPicked(answers);
  const [primary, secondary] = rankHabits(counts, last);
  return {
    counts,
    last,
    archetype: archetypes[primary],
    runnerUp: counts[secondary] > 0 ? archetypes[secondary] : null,
  };
}
