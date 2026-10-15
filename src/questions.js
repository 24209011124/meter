// Each option maps to exactly one reasoning habit. The result is the habit
// a person picked most often, so it is transparent and explainable.
// No option names or hints at any real party or leader.

export const questions = [
  {
    title: 'WhatsApp University',
    emoji: '📲',
    prompt: 'Tumhari favourite political side ke favour mein ek viral claim aata hai. Source missing hai. Kya karoge?',
    options: [
      { text: 'Pakka kuch toh sach hoga. Apne leader ke against thodi hai!', habit: 'andhbhakt' },
      { text: 'Forward karo. Opposition ko jawab milna chahiye!', habit: 'chamcha' },
      { text: 'Source aur original report check karunga.', habit: 'factChecker' },
      { text: 'Politics ka forward hai. Seen karke aage badho.', habit: 'spectator' },
    ],
  },
  {
    title: 'Same kaam, different reaction',
    emoji: '⚖️',
    prompt: 'Jo decision opposition ke time tumne galat bola tha, wahi tumhari side le leti hai. Ab?',
    options: [
      { text: 'Mere leader ke paas koi reason hoga jo humein nahi pata.', habit: 'andhbhakt' },
      { text: 'Pehle opposition ke time unhone kya kiya tha, woh dekho!', habit: 'chamcha' },
      { text: 'Dono cases ka context aur evidence compare karunga.', habit: 'factChecker' },
      { text: 'Party koi bhi ho, actual result aur delivery matter karte hain.', habit: 'manifesto' },
    ],
  },
  {
    title: 'Family dinner ka political test',
    emoji: '🍛',
    prompt: 'Friends ke saamne tumhare favourite leader ko credible evidence se challenge kiya jaata hai. Tum?',
    options: [
      { text: 'Evidence genuine hai toh maanna padega, chahe awkward ho.', habit: 'independent' },
      { text: 'Ek minute, source aur full context toh check karne do.', habit: 'factChecker' },
      { text: 'Achha? Pehle batao tumhari party ne kya kiya tha!', habit: 'chamcha' },
      { text: 'Politics chhodo yaar, samosa thanda ho raha hai.', habit: 'spectator' },
    ],
  },
  {
    title: 'Manifesto ya marketing?',
    emoji: '🎤',
    prompt: 'Election mein tumhare area ke liye paanch bade promises kiye gaye. Tumhara next move?',
    options: [
      { text: 'Leader ne bola hai, toh kuch soch ke hi bola hoga.', habit: 'andhbhakt' },
      { text: 'Promises aur deadlines note karke progress track karunga.', habit: 'manifesto' },
      { text: 'Pichhle promises ka report card check karunga.', habit: 'independent' },
      { text: 'Speech sab dete hain. Pehle sources aur details verify karunga.', habit: 'factChecker' },
    ],
  },
  {
    title: 'Debate ka asli winner',
    emoji: '📺',
    prompt: 'Tumhari side ka spokesperson sawaal ka seedha jawab nahi deta, lekin opponent bhi interrupt kar raha hai. Tum?',
    options: [
      { text: 'Opponent ko tameez nahi hai. Bas wahi main point hai.', habit: 'chamcha' },
      { text: 'Sawaal kya tha aur jawab mila ya nahi?', habit: 'manifesto' },
      { text: 'Clip viral hone do. Meme material chahiye.', habit: 'spectator' },
      { text: 'Full debate dekhunga. Ek clip se conclusion nahi nikalta.', habit: 'factChecker' },
    ],
  },
  {
    title: 'Election haar gaye',
    emoji: '🗳️',
    prompt: 'Tumhari preferred party election haar gayi. Group chat mein kya hoga?',
    options: [
      { text: 'Kuch toh setting hui hogi. Aise kaise haar sakte hain?', habit: 'andhbhakt' },
      { text: 'Winners ki galtiyan ginwao. Unko bhi toh expose karna hai!', habit: 'chamcha' },
      { text: 'Apni side ki mistakes aur voters ke feedback ka analysis karunga.', habit: 'independent' },
      { text: 'Ab winners ke promises aur performance track karenge.', habit: 'manifesto' },
    ],
  },
  {
    title: 'Opposition ko credit?',
    emoji: '😶',
    prompt: 'Opposing party ek genuinely achha kaam karti hai, jiska tumhe fayda bhi hota hai. Tum?',
    options: [
      { text: 'Achha kaam hai toh credit dunga, party koi bhi ho.', habit: 'independent' },
      { text: 'Pehle verify karunga ki result sach mein achha hai ya nahi.', habit: 'factChecker' },
      { text: 'Fayda le lunga, par unki tareef? Itni bhi nahi.', habit: 'chamcha' },
      { text: 'Ek kaam se kya hota hai? Long-term delivery dekhunga.', habit: 'manifesto' },
    ],
  },
];

const englishTitles = [
  'WhatsApp University',
  'Same action, different reaction',
  'The family-dinner political test',
  'Manifesto or marketing?',
  'Who really won the debate?',
  'We lost the election',
  'Give the opposition credit?',
];

const englishPrompts = [
  'A viral claim supporting your preferred political side appears. There is no source. What do you do?',
  'Your side takes the same decision that you called wrong when the opposition did it. Now what?',
  'Friends challenge your favourite leader with credible evidence. What do you do?',
  'Five big promises are made for your area during an election. What is your next move?',
  'Your side’s spokesperson does not answer the question directly, but the opponent is also interrupting. What do you do?',
  'Your preferred party loses the election. What happens in the group chat?',
  'The opposing party does something genuinely good that benefits you too. What do you do?',
];

const englishOptions = [
  [
    'It must be partly true. It is not attacking my leader!',
    'Forward it. The opposition needs an answer!',
    'I will check the source and the original report.',
    'It is a political forward. I will see it and move on.',
  ],
  [
    'My leader must have a reason we do not know about.',
    'First look at what they did when they were in opposition!',
    'I will compare the context and evidence in both cases.',
    'Party aside, the actual result and delivery are what matter.',
  ],
  [
    'If the evidence is genuine, I have to accept it, even if it is awkward.',
    'One minute. Let me check the source and full context.',
    'Really? First tell me what your party has done!',
    'Leave politics, yaar. The samosas are getting cold.',
  ],
  [
    'The leader said it, so they must have thought it through.',
    'I will note the promises and deadlines and track progress.',
    'I will check the report card for previous promises.',
    'Everyone gives speeches. I will verify the sources and details first.',
  ],
  [
    'The opponent has no manners. That is the main point.',
    'What was the question, and was it answered?',
    'Let the clip go viral. I need meme material.',
    'I will watch the full debate. One clip is not enough for a conclusion.',
  ],
  [
    'Something must have been fixed. How could we lose like that?',
    'List the winners’ mistakes. They need to be exposed too!',
    'I will analyse my side’s mistakes and the voters’ feedback.',
    'Now we will track the winners’ promises and performance.',
  ],
  [
    'If it is good work, I will give credit. Party aside.',
    'I will first verify whether the result is genuinely good.',
    'I will take the benefit, but praise them? Not that much.',
    'One good action proves nothing. I will watch long-term delivery.',
  ],
];

export const englishQuestions = questions.map((question, questionIndex) => ({
  ...question,
  title: englishTitles[questionIndex],
  prompt: englishPrompts[questionIndex],
  options: question.options.map((option, optionIndex) => ({
    ...option,
    text: englishOptions[questionIndex][optionIndex],
  })),
}));
