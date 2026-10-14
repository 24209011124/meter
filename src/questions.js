// Each option maps to exactly one reasoning habit. The result is simply the habit
// a person picked most often, so it is transparent and explainable.
// Habits: andhbhakt (leader can't be wrong), chamcha (my side can't be wrong / whataboutery),
// factChecker, spectator, manifesto (accountability on delivery), independent (same rules for everyone).
// No option names or hints at any real party or leader.

export const questions = [
  {
    prompt: 'Tumhare favourite leader ki ek badi galti saamne aati hai. First reaction?',
    options: [
      { text: 'Unhone soch samajh ke hi kiya hoga. Hum poori picture nahi jaante.', habit: 'andhbhakt' },
      { text: 'Haan toh? Doosri side ne isse bada kaand kiya tha.', habit: 'chamcha' },
      { text: 'Pehle original video ya statement dekhunga. Clip toh kuch bhi ho sakti hai.', habit: 'factChecker' },
      { text: 'Galti hai toh galti hai. Kisi ki bhi ho, rule same.', habit: 'independent' },
    ],
  },
  {
    prompt: 'Family group mein "BREAKING 🚨" wala forward aata hai. Forwarded many times.',
    options: [
      { text: 'Bina padhe 👍 de deta hoon. Ghar ki shanti zaroori hai.', habit: 'spectator' },
      { text: '"Source?" likh deta hoon. Phir group mein sannata.', habit: 'factChecker' },
      { text: 'Meri side ke favour mein hai? Ek baar aage bhej hi deta hoon.', habit: 'chamcha' },
      { text: 'Leader ke baare mein positive hai, toh mostly sach hi hoga.', habit: 'andhbhakt' },
    ],
  },
  {
    prompt: 'Election se pehle ek bada promise kiya gaya tha. Ab tak poora nahi hua.',
    options: [
      { text: 'Maine note karke rakha hai kaunsa promise kab kiya tha.', habit: 'manifesto' },
      { text: 'Itne bade kaam mein time lagta hai. Patience rakho.', habit: 'andhbhakt' },
      { text: 'Pehle kaunsi sarkar ne saare promises poore kiye the?', habit: 'chamcha' },
      { text: 'Promises toh sab karte hain. Mujhe kya.', habit: 'spectator' },
    ],
  },
  {
    prompt: 'Best friend tumse bilkul ulta political sochta hai. Chai pe topic aa gaya.',
    options: [
      { text: 'Topic change: "Bhai, kal ka match dekha?"', habit: 'spectator' },
      { text: 'Uska jo point sahi hai, maan leta hoon. Jo galat hai, bol deta hoon.', habit: 'independent' },
      { text: 'Links aur data ke saath ready hoon.', habit: 'factChecker' },
      { text: 'Usko yaad dilata hoon ki uski side ne kya-kya kiya hai.', habit: 'chamcha' },
    ],
  },
  {
    prompt: 'TV pe tumhare favourite leader ka tough interview chal raha hai.',
    options: [
      { text: 'Anchor ka agenda clear hai. Interview fair nahi tha.', habit: 'andhbhakt' },
      { text: 'Main dekh raha hoon ki seedhe jawaab mile ya nahi.', habit: 'manifesto' },
      { text: 'Poora interview dekhunga. Clips pe judge nahi karunga.', habit: 'factChecker' },
      { text: 'Popcorn ready hai. Entertainment hai bhai.', habit: 'spectator' },
    ],
  },
  {
    prompt: 'Jo kaam tumne pichhle saal doosri side ka galat bataya tha, wahi ab tumhari side kar rahi hai.',
    options: [
      { text: 'Tab bhi galat tha, ab bhi galat hai.', habit: 'independent' },
      { text: 'Situation alag hai. Inki majboori samjho.', habit: 'chamcha' },
      { text: 'Bade decisions ka logic baad mein samajh aata hai.', habit: 'andhbhakt' },
      { text: 'Result dekh ke judge karunga. Kaam hua ya nahi, wahi matter karta hai.', habit: 'manifesto' },
    ],
  },
  {
    prompt: 'Tumhari preferred side election haar jaati hai.',
    options: [
      { text: 'Mujhe kya. Kal se office toh jaana hi hai.', habit: 'spectator' },
      { text: 'Haar ke reasons aur kaam ka report card dekhna padega.', habit: 'manifesto' },
      { text: 'Jeetne wale bhi kaunse dhoodh ke dhule hain.', habit: 'chamcha' },
      { text: 'Main kisi side ko apna nahi maanta. Issue dekh ke vote karta hoon.', habit: 'independent' },
    ],
  },
  {
    prompt: 'Viral screenshot: "Leader X ne ye bola!" Koi source nahi.',
    options: [
      { text: 'Official handle aur original source check karta hoon.', habit: 'factChecker' },
      { text: 'Sach ho ya na ho, funny hai. Share.', habit: 'spectator' },
      { text: 'Doosri side ke leader ka hai? Phir toh sach hi hoga.', habit: 'chamcha' },
      { text: 'Apni side ke leader ka hota toh bhi check karta. Toh ab bhi karunga.', habit: 'independent' },
    ],
  },
  {
    prompt: 'Nayi policy tumhe fayda deti hai, par kisi aur group ko nuksaan ho sakta hai.',
    options: [
      { text: 'Sirf apna nahi, dono taraf ka impact dekhunga.', habit: 'independent' },
      { text: 'Dekhunga ye kis promise ka hissa thi aur iska target kya hai.', habit: 'manifesto' },
      { text: 'Leader laaye hain toh long-term mein sabka fayda hi hoga.', habit: 'andhbhakt' },
      { text: 'Mujhe fayda hai. Main debate mein kyun padun?', habit: 'spectator' },
    ],
  },
  {
    prompt: 'Kya cheez tumhe apne favourite leader ya side par rethink karwa sakti hai?',
    options: [
      { text: 'Itne saal ka track record hai. Ek-do baat se opinion nahi badalta.', habit: 'andhbhakt' },
      { text: 'Credible sources se solid evidence.', habit: 'factChecker' },
      { text: 'Lagatar toote promises aur zameen pe kaam na dikhna.', habit: 'manifesto' },
      { text: 'Mera koi permanent favourite hai hi nahi. Har issue alag.', habit: 'independent' },
    ],
  },
];
