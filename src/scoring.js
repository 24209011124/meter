import { questions } from './questions.js';

// These are behaviour patterns, not party labels. Any side's supporter can get any result.
export const archetypes = {
  andhbhakt: {
    id: 'andhbhakt',
    emoji: '🙈',
    title: 'Andhbhakt Mode: ON',
    subtitle: 'Leader bole toh final answer.',
    description: 'Tumhara pehla instinct apne leader par bharosa karna hai. Criticism valid hai ya nahi, ye check karne se pehle hi unfair lag sakta hai.',
    superpower: 'Loyalty ekdum solid. Mushkil time mein bhi saath nahi chhodte.',
    weakness: 'Leader ko bhi kabhi-kabhi galat maanna padta hai. Evidence ko bhi mic do.',
    verdict: 'Faith full volume par hai. Ab thoda volume sawaalon ka bhi badhao.',
  },
  chamcha: {
    id: 'chamcha',
    emoji: '🥄',
    title: 'Chamcha Mode: ON',
    subtitle: 'Unofficial PR manager.',
    description: 'Tumhari side ke paas har situation ke liye defence ready hai. Ek argument fail ho toh whataboutery drafts mein mil jaati hai.',
    superpower: 'Kisi bhi bahas mein counter-example 2 second mein ready.',
    weakness: 'Doosre ki galti se apni galti sahi nahi ho jaati.',
    verdict: 'Whataboutery mein PhD. Ab "same rules for all" wala elective bhi lo.',
  },
  factChecker: {
    id: 'factChecker',
    emoji: '🔎',
    title: 'Fact-Check Wala',
    subtitle: 'Source bhej, bhai!',
    description: 'Screenshot tumhe impress nahi karta. Pehle original claim, evidence aur thoda kam WhatsApp University chahiye.',
    superpower: 'Fake news tumhare saamne do minute nahi tikti.',
    weakness: 'Har family forward investigation nahi hai. Kabhi-kabhi bas good morning hai.',
    verdict: 'Tumhara trust button evidence se unlock hota hai.',
  },
  spectator: {
    id: 'spectator',
    emoji: '🍿',
    title: 'Political Spectator',
    subtitle: 'Debate ka popcorn investor.',
    description: 'Politics tumhare liye ek spectacle bhi hai. Show dekhna easy hai, par kabhi-kabhi meme actual issue se zyada attention le leta hai.',
    superpower: 'BP normal. Politics ko dil pe nahi lete.',
    weakness: 'Kuch issues tumhari life pe bhi asar daalte hain. Kabhi-kabhi dhyaan bhi do.',
    verdict: 'Vibes neutral hain. Kabhi-kabhi vote of attention bhi de do.',
  },
  manifesto: {
    id: 'manifesto',
    emoji: '📋',
    title: 'Manifesto Auditor',
    subtitle: 'Speech ho gayi. Ab delivery report dikhao.',
    description: 'Promises easy hain. Tum deadlines, measurable results aur ye dekhte ho ki kaam logon tak pahuncha ya nahi.',
    superpower: 'Bhaashan se zyada kaam dekhte ho.',
    weakness: 'Har kaam ka result turant nahi dikhta. Context bhi dekhna padta hai.',
    verdict: 'Report card haath mein hai. Neta log, attendance lag rahi hai.',
  },
  independent: {
    id: 'independent',
    emoji: '🧠',
    title: 'Independent Thinker',
    subtitle: 'Rules sabke liye same.',
    description: 'Tum consistent standards apply karne ki koshish karte ho, chahe answer apni side ke liye inconvenient hi kyun na ho.',
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
    throw new Error('A complete set of seven valid answers is required.');
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
