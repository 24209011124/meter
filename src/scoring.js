export const scoringMap = [
  {
    question: 1,
    options: [
      { loyaltyBias: 3, criticalEvaluation: 0, engagementStyle: 1 },
      { loyaltyBias: 1, criticalEvaluation: 3, engagementStyle: 2 },
      { loyaltyBias: 3, criticalEvaluation: 1, engagementStyle: 1 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
    ],
  },
  {
    question: 2,
    options: [
      { loyaltyBias: 2, criticalEvaluation: 0, engagementStyle: 1 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 2 },
      { loyaltyBias: 2, criticalEvaluation: 1, engagementStyle: 1 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
    ],
  },
  {
    question: 3,
    options: [
      { loyaltyBias: 0, criticalEvaluation: 2, engagementStyle: 2 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 2, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 2 },
    ],
  },
  {
    question: 4,
    options: [
      { loyaltyBias: 0, criticalEvaluation: 2, engagementStyle: 3 },
      { loyaltyBias: 1, criticalEvaluation: 0, engagementStyle: 1 },
      { loyaltyBias: 0, criticalEvaluation: 2, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
    ],
  },
  {
    question: 5,
    options: [
      { loyaltyBias: 0, criticalEvaluation: 2, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 1, engagementStyle: 0 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 2, engagementStyle: 1 },
    ],
  },
  {
    question: 6,
    options: [
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 2 },
      { loyaltyBias: 1, criticalEvaluation: 1, engagementStyle: 1 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 2 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
    ],
  },
  {
    question: 7,
    options: [
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 2, criticalEvaluation: 1, engagementStyle: 2 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 2 },
    ],
  },
  {
    question: 8,
    options: [
      { loyaltyBias: 0, criticalEvaluation: 2, engagementStyle: 3 },
      { loyaltyBias: 2, criticalEvaluation: 2, engagementStyle: 2 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 2, engagementStyle: 2 },
    ],
  },
  {
    question: 9,
    options: [
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 1, criticalEvaluation: 2, engagementStyle: 2 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
    ],
  },
  {
    question: 10,
    options: [
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
      { loyaltyBias: 0, criticalEvaluation: 3, engagementStyle: 3 },
    ],
  },
];

export const archetypes = {
  andhbhakt: {
    id: 'andhbhakt',
    emoji: '🪷',
    title: 'Andhbhakt Mode: ON',
    subtitle: 'IT Cell ka unpaid intern',
    description: 'Leader bole toh final answer. Doubt ka option syllabus mein nahi hai.',
    superpower: 'Favourite side ko defend karne ke arguments turant mil jaate hain.',
    weakness: 'Kabhi-kabhi criticism ko fair hearing dena bhi zaroori hota hai.',
    verdict: 'Loyalty full volume par hai. Evidence ko bhi mic do.',
  },
  chamcha: {
    id: 'chamcha',
    emoji: '✋',
    title: 'Chamcha Mode: ON',
    subtitle: 'High Command ka PR manager',
    description: 'High Command ke decisions ka unofficial customer support.',
    superpower: 'Har decision ke peeche explanation dhoondh lete ho.',
    weakness: 'Sabke liye same standards apply karna bhi important hai.',
    verdict: 'Explanation department strong hai. Accountability department ko bhi call karo.',
  },
  factChecker: {
    id: 'factChecker',
    emoji: '🔎',
    title: 'Fact-Check Wala',
    subtitle: 'Source bhej, bhai!',
    description: 'Forward baad mein karna, source pehle bhejna.',
    superpower: 'Claims ko verify karne ki habit.',
    weakness: 'Har chhoti baat ko investigation banana zaroori nahi.',
    verdict: 'Tumhara trust button evidence se unlock hota hai.',
  },
  spectator: {
    id: 'spectator',
    emoji: '🍿',
    title: 'Political Spectator',
    subtitle: 'Debate ka popcorn investor',
    description: 'Tum debate karo, main popcorn arrange karta hoon.',
    superpower: 'Har political argument ko personal nahi lete.',
    weakness: 'Kabhi-kabhi important issues par informed participation bhi matter karti hai.',
    verdict: 'Vibes neutral hain. Kabhi-kabhi vote of attention bhi de do.',
  },
  manifesto: {
    id: 'manifesto',
    emoji: '⚖️',
    title: 'Manifesto Auditor',
    subtitle: 'Speech ho gayi. Ab delivery report dikhao.',
    description: 'Promises note kar liye. Ab performance ka hisaab do.',
    superpower: 'Accountability aur delivery par focus.',
    weakness: 'Performance judge karte waqt context aur evidence bhi dekhna zaroori hai.',
    verdict: 'Manifesto padha hai. Ab footnotes aur delivery timeline bhi chahiye.',
  },
  independent: {
    id: 'independent',
    emoji: '🧠',
    title: 'Independent Thinker',
    subtitle: 'Dimaag ki sarkar independent hai.',
    description: 'Party koi bhi ho, meri dimaag ki sarkar independent hai.',
    superpower: 'Har issue ko independently evaluate karne ki tendency.',
    weakness: 'Apne judgement ko bhi new evidence ke against test karte rehna chahiye.',
    verdict: 'Party koi bhi ho, tumhara fact-checker duty par hai.',
  },
};

export function scoreAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== scoringMap.length || answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
    throw new Error('A complete set of ten valid answers is required.');
  }

  return answers.reduce((totals, answer, questionIndex) => {
    const scores = scoringMap[questionIndex].options[answer];
    totals.loyaltyBias += scores.loyaltyBias;
    totals.criticalEvaluation += scores.criticalEvaluation;
    totals.engagementStyle += scores.engagementStyle;
    return totals;
  }, { loyaltyBias: 0, criticalEvaluation: 0, engagementStyle: 0 });
}

export function classifyProfile(profile) {
  const { loyaltyBias, criticalEvaluation, engagementStyle } = profile;

  if (loyaltyBias >= 10 && criticalEvaluation <= 14) return archetypes.andhbhakt;
  if (loyaltyBias >= 7 && criticalEvaluation <= 21) return archetypes.chamcha;
  if (engagementStyle <= 18) return archetypes.spectator;
  if (engagementStyle >= 26 && criticalEvaluation >= 25) return archetypes.manifesto;
  if (criticalEvaluation >= 27 && loyaltyBias <= 5) return archetypes.factChecker;
  return archetypes.independent;
}

export function getResult(answers) {
  const profile = scoreAnswers(answers);
  return { profile, archetype: classifyProfile(profile) };
}