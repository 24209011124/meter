import { questions } from './questions.js?v=2026-10-17';

// These are behaviour patterns, not party labels. Any side's supporter can get any result.
// title: big result name · subtitle: short tag · description: one-line roast (goes on the share card)
// verdict: plain explanation of the behaviour · superpower / weakness: the two trait boxes
export const archetypes = {
  andhbhakt: {
    id: 'andhbhakt',
    emoji: '🙈',
    title: 'Andhbhakt Mode: ON',
    subtitle: 'Bharosa 100%. Sawaal 0%.',
    description: 'Leader bole toh final answer. Doubt ka option syllabus mein nahi hai.',
    verdict: 'Tum sach mein maante ho ki tumhara leader galat ho hi nahi sakta. Evidence aaye toh bhi pehla reaction hota hai: "propaganda hai."',
    superpower: 'Loyalty ekdum solid. Mushkil time mein bhi saath nahi chhodte.',
    weakness: 'Leader bhi insaan hai. Kabhi-kabhi evidence ko bhi mic do.',
  },
  chamcha: {
    id: 'chamcha',
    emoji: '🥄',
    title: 'Chamcha Mode: ON',
    subtitle: '"Unhone bhi toh kiya tha" ke brand ambassador.',
    description: 'Party ka unofficial customer support. 24x7 available.',
    verdict: 'Tumhe pata hai apni side kabhi-kabhi galat hoti hai. Par maanne ke bajaye tum excuse dhoondhte ho, topic badal dete ho, ya doosri side ki list nikaal lete ho.',
    superpower: 'Kisi bhi bahas mein counter-example 2 second mein ready.',
    weakness: 'Doosre ki galti se apni galti sahi nahi ho jaati.',
  },
  factChecker: {
    id: 'factChecker',
    emoji: '🔎',
    title: 'Fact-Check Wala',
    subtitle: 'Group ka unpaid fact-checker.',
    description: 'Forward baad mein. Source pehle, bhai!',
    verdict: 'Koi bhi claim ho, tum pehle source, context aur original video dhoondhte ho. Screenshot tumhare liye evidence nahi hai.',
    superpower: 'Fake news tumhare saamne do minute nahi tikti.',
    weakness: 'Har family forward investigation nahi hai. Kabhi-kabhi bas good morning hai.',
  },
  spectator: {
    id: 'spectator',
    emoji: '🍿',
    title: 'Political Spectator',
    subtitle: 'Opinion pending. Popcorn ready.',
    description: 'Debate ka popcorn investor.',
    verdict: 'Politics ka drama aur memes tumhe pasand hain, par tum mostly sideline se dekhte ho. Bahas mein kudna tumhara style nahi.',
    superpower: 'BP normal. Politics ko dil pe nahi lete.',
    weakness: 'Kuch issues tumhari life pe bhi asar daalte hain. Kabhi-kabhi dhyaan bhi do.',
  },
  manifesto: {
    id: 'manifesto',
    emoji: '📋',
    title: 'Manifesto Auditor',
    subtitle: 'Promises ka chartered accountant.',
    description: 'Speech ho gayi. Ab delivery report dikhao.',
    verdict: 'Bhaashan se tum impress nahi hote. Promises, deadlines aur zameen pe kaam, bas inhi pe judge karte ho.',
    superpower: 'Bhaashan se zyada kaam dekhte ho.',
    weakness: 'Har kaam ka result turant nahi dikhta. Context bhi dekhna padta hai.',
  },
  independent: {
    id: 'independent',
    emoji: '🧠',
    title: 'Independent Thinker',
    subtitle: 'Rules sabke liye same.',
    description: 'Dimaag ki sarkar independent hai.',
    verdict: 'Tum har issue ko alag se judge karte ho, doosri side ko bhi credit dete ho, aur naya evidence aaye toh opinion badal sakte ho.',
    superpower: 'Apni side ko bhi wahi sawaal poochte ho jo doosri side ko.',
    weakness: '"Main neutral hoon" bolna aasaan hai. Apne aap ko bhi check karte raho.',
  },
};

// Fixed listing order only (used as the very last resort, which a real answer set never reaches).
export const tieBreakOrder = ['andhbhakt', 'chamcha', 'spectator', 'manifesto', 'factChecker', 'independent'];

function validate(answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length || answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    throw new Error(`A complete set of ${questions.length} valid answers is required.`);
  }
}

export function countHabits(answers) {
  validate(answers);
  const counts = Object.fromEntries(tieBreakOrder.map((habit) => [habit, 0]));
  answers.forEach((answer, index) => { counts[questions[index].options[answer].habit] += 1; });
  return counts;
}

// Tie-break evidence for each habit: did the person pick that habit's signature answer, and when did they last pick it.
export function tieEvidence(answers) {
  validate(answers);
  const evidence = Object.fromEntries(tieBreakOrder.map((habit) => [habit, { signature: false, last: -1 }]));
  answers.forEach((answer, index) => {
    const option = questions[index].options[answer];
    evidence[option.habit].last = index;
    if (option.signature) evidence[option.habit].signature = true;
  });
  return evidence;
}

// How many times each habit was offered as an option. Habits do not all appear equally often
// (7 questions × 4 options = 28 slots for 6 habits), so scores are compared as a share of chances.
export const chances = Object.fromEntries(tieBreakOrder.map((habit) => [habit, 0]));
questions.forEach((question) => question.options.forEach((option) => { chances[option.habit] += 1; }));

export const habitScore = (counts, habit) => counts[habit] / chances[habit];

// Rank: highest share of chances taken first. Ties go to the habit whose signature answer
// was chosen, then to the habit picked most recently.
export function rankHabits(counts, evidence = {}) {
  const sig = (habit) => (evidence[habit]?.signature ? 1 : 0);
  const last = (habit) => evidence[habit]?.last ?? -1;
  return [...tieBreakOrder].sort((a, b) => habitScore(counts, b) - habitScore(counts, a) || sig(b) - sig(a) || last(b) - last(a) || tieBreakOrder.indexOf(a) - tieBreakOrder.indexOf(b));
}

export function getResult(answers) {
  const counts = countHabits(answers);
  const evidence = tieEvidence(answers);
  const [primary, secondary] = rankHabits(counts, evidence);
  return {
    counts,
    evidence,
    archetype: archetypes[primary],
    runnerUp: counts[secondary] > 0 ? archetypes[secondary] : null,
  };
}
