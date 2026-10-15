// Each option maps to exactly one reasoning habit, and its wording must describe that habit:
//   andhbhakt   – genuinely believes the leader can do no wrong; evidence barely moves them
//   chamcha     – knows their side may be wrong, but makes excuses, changes the subject or points at the other side
//   factChecker – checks sources, context and evidence before believing or forwarding
//   spectator   – enjoys the drama and memes, mostly watches from the sidelines
//   manifesto   – tracks promises, deadlines, delivery and outcomes
//   independent – same rules for every side, gives credit across lines, can change their mind
//
// `signature: true` marks the single answer that most clearly shows a habit. Each habit has exactly one,
// on a different question. Signatures are used only to break ties (see scoring.js).
// No option names or hints at any real party, leader or event.

const bilingual = [
  {
    title: ['WhatsApp University', 'WhatsApp University'],
    emoji: '📲',
    prompt: [
      'Tumhari favourite side ke favour mein ek viral claim aata hai. Source missing hai. Kya karoge?',
      'A viral claim that helps your favourite side lands in the group. There is no source. What do you do?',
    ],
    options: [
      { habit: 'andhbhakt', text: ['Apne leader ke baare mein hai? Toh sach hi hoga.', 'It is about my leader? Then it must be true.'] },
      { habit: 'chamcha', text: ['Sach ho ya na ho, opposition ko jawab toh milna chahiye. Forward!', 'True or not, the other side deserves a reply. Forward!'] },
      { habit: 'factChecker', text: ['Pehle source aur original report dhoondhunga.', 'I will find the source and the original report first.'], signature: true },
      { habit: 'spectator', text: ['Political forward hai. Seen karke chhod do.', 'It is a political forward. Leave it on seen.'] },
    ],
  },
  {
    title: ['Same kaam, different reaction', 'Same action, different reaction'],
    emoji: '⚖️',
    prompt: [
      'Jo decision opposition ke time tumne galat bola tha, wahi ab tumhari side le leti hai. Ab?',
      'Your side now takes the same decision you called wrong when the other side took it. Now what?',
    ],
    options: [
      { habit: 'andhbhakt', text: ['Mere leader ne liya hai, toh zaroor koi bada reason hoga.', 'My leader took it, so there must be a big reason.'] },
      { habit: 'chamcha', text: ['Haan theek hai, par pehle unhone kya kiya tha woh bhi toh dekho!', 'Fine, but look at what they did first!'], signature: true },
      { habit: 'independent', text: ['Tab galat tha toh ab bhi galat hai. Rule sabke liye same.', 'If it was wrong then, it is wrong now. Same rule for everyone.'] },
      { habit: 'manifesto', text: ['Decision ka actual result kya nikla, wahi dekhunga.', 'I will judge it by what the decision actually delivered.'] },
    ],
  },
  {
    title: ['Family dinner ka political test', 'The family-dinner test'],
    emoji: '🍛',
    prompt: [
      'Family dinner pe koi credible evidence ke saath tumhare favourite leader ki galti dikhata hai. Tum?',
      'At family dinner, someone shows credible evidence of a mistake by your favourite leader. You?',
    ],
    options: [
      { habit: 'andhbhakt', text: ['Ye sab propaganda hai. Mera leader aisa kar hi nahi sakta.', 'This is propaganda. My leader would never do that.'], signature: true },
      { habit: 'chamcha', text: ['Achha? Aur tumhare leader ne jo kiya, uska kya?', 'Really? And what about what your leader did?'] },
      { habit: 'independent', text: ['Evidence sahi hai toh maanunga. Awkward hai, par galat toh galat hai.', 'If the evidence holds, I will accept it. Awkward, but wrong is wrong.'] },
      { habit: 'spectator', text: ['Politics chhodo yaar, samosa thanda ho raha hai.', 'Forget politics, yaar. The samosas are getting cold.'] },
    ],
  },
  {
    title: ['Manifesto ya marketing?', 'Manifesto or marketing?'],
    emoji: '🎤',
    prompt: [
      'Election mein tumhare area ke liye paanch bade promises kiye gaye. Tumhara next move?',
      'Five big promises are made for your area during the election. Your next move?',
    ],
    options: [
      { habit: 'andhbhakt', text: ['Leader ne bola hai, toh ho hi jaayega. Tension kya hai?', 'The leader said it, so it will happen. Why worry?'] },
      { habit: 'manifesto', text: ['Promises aur deadlines note karta hoon. Baad mein hisaab hoga.', 'I note the promises and deadlines. We will settle accounts later.'], signature: true },
      { habit: 'factChecker', text: ['Pehle check karunga ki paisa aur plan kahan se aayega.', 'First I check where the money and the plan will come from.'] },
      { habit: 'spectator', text: ['Har election mein yahi hota hai. Main kyun dimaag lagaun?', 'This happens every election. Why should I bother?'] },
    ],
  },
  {
    title: ['Debate ka asli winner', 'Who really won the debate?'],
    emoji: '📺',
    prompt: [
      'TV debate mein tumhari side ka spokesperson seedha jawab nahi deta. Opponent bhi beech mein interrupt kar raha hai. Tum?',
      'On a TV debate, your side’s spokesperson dodges the question. The opponent keeps interrupting too. You?',
    ],
    options: [
      { habit: 'chamcha', text: ['Asli issue toh opponent ki badtameezi hai. Jawab ki kya zaroorat?', 'The real issue is the opponent’s rudeness. Who needs an answer?'] },
      { habit: 'manifesto', text: ['Sawaal kya tha aur jawab mila ya nahi? Bas itna batao.', 'What was the question, and was it answered? That is all I want.'] },
      { habit: 'spectator', text: ['Popcorn ready. Meme material mil gaya.', 'Popcorn ready. Meme material secured.'], signature: true },
      { habit: 'factChecker', text: ['Poora debate dekhunga. 30-second clip se conclusion nahi.', 'I will watch the full debate. No conclusions from a 30-second clip.'] },
    ],
  },
  {
    title: ['Election haar gaye', 'We lost the election'],
    emoji: '🗳️',
    prompt: [
      'Tumhari preferred party election haar gayi. Group chat mein tumhara message?',
      'Your preferred party lost the election. Your message in the group chat?',
    ],
    options: [
      { habit: 'andhbhakt', text: ['Kuch toh gadbad hui hai. Mera leader aise haar hi nahi sakta.', 'Something is fishy. My leader cannot lose like this.'] },
      { habit: 'factChecker', text: ['Gadbad ke forwards aayenge. Main pehle evidence maangunga.', '“It was rigged” forwards will come. I will ask for evidence first.'] },
      { habit: 'independent', text: ['Humari side ne bhi galtiyan ki. Voters ka message samajhna padega.', 'Our side made mistakes too. We need to hear what voters said.'] },
      { habit: 'manifesto', text: ['Ab jeetne walon ke promises track karenge. Clock shuru.', 'Now we track the winners’ promises. The clock starts today.'] },
    ],
  },
  {
    title: ['Opposition ko credit?', 'Credit to the other side?'],
    emoji: '😶',
    prompt: [
      'Doosri party ek genuinely achha kaam karti hai, jiska tumhe bhi fayda hota hai. Tum?',
      'The other party does something genuinely good that benefits you too. You?',
    ],
    options: [
      { habit: 'independent', text: ['Achha kaam hai toh credit dunga. Party koi bhi ho.', 'Good work gets credit from me. Whatever the party.'], signature: true },
      { habit: 'factChecker', text: ['Pehle data dekhunga ki sach mein fayda hua ya sirf PR hai.', 'I will check the data to see if it really helped or is just PR.'] },
      { habit: 'chamcha', text: ['Fayda le lunga, par tareef? Asli idea toh humara tha.', 'I will take the benefit, but praise? It was really our idea.'] },
      { habit: 'manifesto', text: ['Ek kaam se kya hota hai? Poora report card dekhunga.', 'One good deed is not enough. I want the full report card.'] },
    ],
  },
];

const pick = (lang) => bilingual.map((question) => ({
  title: question.title[lang],
  emoji: question.emoji,
  prompt: question.prompt[lang],
  options: question.options.map((option) => ({ habit: option.habit, text: option.text[lang], signature: Boolean(option.signature) })),
}));

export const questions = pick(0);
export const englishQuestions = pick(1);
