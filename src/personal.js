import { findParty, personalWords, fillTokens } from './parties.js?v=2026-10-22';

// Result lines that use the party/leader picked before the quiz.
// Every line roasts the PLAYER's habit, never the party or leader.
//
// Where they appear:
//   - Result page (the player's own screen): for real parties, "other" and custom parties.
//   - Share card + share text: ONLY for an invented ("Apni party banao") party. A real party name next to
//     "Andhbhakt Mode: ON" on a WhatsApp Status reads as "this party's voters are blind followers",
//     which is the political fight this site avoids. Flip SHARE_REAL_PARTIES to true to change that.
export const SHARE_REAL_PARTIES = false;

// [Hinglish, English]. {leader} lines are used when a leader was picked; {party} lines otherwise.
const lines = {
  andhbhakt: {
    leader: ['Agar {leader} bolein ki chai mein namak daalo, tum bologe "Vision hai, tum nahi samjhoge." ☕🧂', 'If {leader} said "add salt to your chai", you would say "It is vision, you won’t get it." ☕🧂'],
    party: ['{Party} kuch bhi kare, tumhara reply ready hai: "Sab soch samajh ke kiya hai." 🙈', 'Whatever {party} does, your reply is ready: "It was all thought through." 🙈'],
  },
  chamcha: {
    leader: ['{Leader} se koi sawaal pooche, tumhara jawaab: "Pehle unka dekho!" Tum 24x7 customer care ho. 📞', 'Ask {leader} anything and you answer: "Look at them first!" You are 24x7 customer care. 📞'],
    party: ['{Party} pe sawaal aaye toh tum topic badalne mein national champion ho. 🥄', 'When {party} gets questioned, you are the national champion of changing the topic. 🥄'],
  },
  factChecker: {
    leader: ['{Leader} ka viral clip bhi aaye, tum pehle original video maangoge. Respect. 🔎', 'Even for a viral {leader} clip, you ask for the original video first. Respect. 🔎'],
    party: ['{Party} ke favour wala forward bhi tumhare "Source?" se nahi bachta. 🔎', 'Even a forward praising {party} doesn’t escape your "Source?". 🔎'],
  },
  spectator: {
    leader: ['{Leader} ki rally ho ya debate, tum front row mein popcorn ke saath. Opinion? Baad mein. 🍿', 'A {leader} rally or a debate, you are front row with popcorn. Opinion? Later. 🍿'],
    party: ['{Party} jeete ya haare, tumhara popcorn kabhi khatam nahi hota. 🍿', '{Party} wins or loses, your popcorn never runs out. 🍿'],
  },
  manifesto: {
    leader: ['{Leader} ke har promise ki deadline tumhare calendar mein hai. Reminder on. 📅', 'Every promise {leader} makes has a deadline in your calendar. Reminder on. 📅'],
    party: ['{Party} ka manifesto tumne padha bhi hai aur highlight bhi kiya hai. Rare. 📋', 'You have read {party}’s manifesto and highlighted it. Rare. 📋'],
  },
  independent: {
    leader: ['{Leader} pasand hain, par galat ho toh tum bolne se nahi darte. Rare species. 🦄', 'You like {leader}, but you still say so when they are wrong. Rare species. 🦄'],
    party: ['{Party} tumhari pasand hai, par andha bharosa nahi. Rare species. 🦄', 'You prefer {party}, but not blindly. Rare species. 🦄'],
  },
};

// Extra line only for invented parties, where the "leader" is often a friend. Made to be screenshotted.
const customExtra = [
  'Supreme leader {leader} ko ye result zaroor bhejna. Party meeting mein discuss hoga. 😂',
  'Send this result to supreme leader {leader}. It will be discussed at the party meeting. 😂',
];
const customExtraNoLeader = [
  '{Party} ki agli meeting mein ye result zaroor discuss karna. 😂',
  'Bring this result up at the next {party} meeting. 😂',
];

const hasTeam = (preference) => Boolean(preference && (findParty(preference.partyId, preference) || preference.partyId === 'other'));
const isCustom = (preference) => preference?.partyId === 'custom' && Boolean(preference.custom);

// Lines for the result page. lang: 0 = Hinglish, 1 = English. Returns null when nothing was picked.
export function personalResult(archetypeId, preference, lang) {
  if (!hasTeam(preference) || !lines[archetypeId]) return null;
  const words = personalWords(preference, lang);
  const party = findParty(preference.partyId, preference);
  const useLeader = Boolean(party && preference.leader);
  const line = fillTokens(lines[archetypeId][useLeader ? 'leader' : 'party'][lang], words);
  let extra = null;
  if (isCustom(preference)) extra = fillTokens((preference.leader ? customExtra : customExtraNoLeader)[lang], words);
  return {
    symbol: party?.symbol || '🗳️',
    team: party ? party.short : words.Party,
    leader: useLeader ? preference.leader : null,
    line,
    extra,
  };
}

const shareable = (preference) => hasTeam(preference) && (isCustom(preference) || (SHARE_REAL_PARTIES && preference.partyId !== 'other'));

// Replaces "Mera political verdict:" on the share card. null = keep the default.
export function cardKicker(preference, lang) {
  if (!shareable(preference)) return null;
  const party = findParty(preference.partyId, preference);
  return lang === 0 ? `${party.symbol ? `${party.symbol} ` : ''}${party.short} supporter ka verdict:` : `${party.symbol ? `${party.symbol} ` : ''}${party.short} supporter’s verdict:`;
}

// Extra sentence for the share message. Empty string = no change.
export function shareFlavour(preference, lang) {
  if (!shareable(preference)) return '';
  const party = findParty(preference.partyId, preference);
  const leader = preference.leader;
  if (lang === 0) return leader ? `Main "${party.short}" (supreme leader: ${leader} 😂) ka supporter hoon, aur result ye aaya:` : `Main "${party.short}" ka supporter hoon, aur result ye aaya:`;
  return leader ? `I support "${party.short}" (supreme leader: ${leader} 😂) and this is my result:` : `I support "${party.short}" and this is my result:`;
}
