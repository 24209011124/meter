// Party preference shown before the quiz, ONLY to make the questions feel real.
// It is never scored, never stored (no localStorage, no URL, no analytics) and never shown on results or share cards.
//
// Symbols are everyday emoji stand-ins, not official party logos. Parties without a fitting emoji show their short name.
// Leaders are well-known faces only, listed without titles so the list doesn't go stale when posts change.
// Review this list before each election season. Last checked: October 2026.

export const parties = [
  { id: 'bjp', short: 'BJP', name: 'Bharatiya Janata Party', symbol: '🪷', leaders: ['Narendra Modi', 'Amit Shah', 'Yogi Adityanath'] },
  { id: 'inc', short: 'Congress', name: 'Indian National Congress', symbol: '✋', leaders: ['Rahul Gandhi', 'Mallikarjun Kharge', 'Priyanka Gandhi Vadra'] },
  { id: 'aap', short: 'AAP', name: 'Aam Aadmi Party', symbol: '🧹', leaders: ['Arvind Kejriwal', 'Bhagwant Mann', 'Atishi'] },
  { id: 'tmc', short: 'TMC', name: 'All India Trinamool Congress', symbol: '🌱', leaders: ['Mamata Banerjee', 'Abhishek Banerjee'] },
  { id: 'sp', short: 'SP', name: 'Samajwadi Party', symbol: '🚲', leaders: ['Akhilesh Yadav', 'Dimple Yadav'] },
  { id: 'tvk', short: 'TVK', name: 'Tamilaga Vettri Kazhagam', symbol: '', leaders: ['Vijay'] },
  { id: 'dmk', short: 'DMK', name: 'Dravida Munnetra Kazhagam', symbol: '🌅', leaders: ['M. K. Stalin', 'Udhayanidhi Stalin'] },
  { id: 'bsp', short: 'BSP', name: 'Bahujan Samaj Party', symbol: '🐘', leaders: ['Mayawati', 'Akash Anand'] },
  { id: 'tdp', short: 'TDP', name: 'Telugu Desam Party', symbol: '🚲', leaders: ['N. Chandrababu Naidu', 'Nara Lokesh'] },
  { id: 'jdu', short: 'JD(U)', name: 'Janata Dal (United)', symbol: '🏹', leaders: ['Nitish Kumar'] },
  { id: 'rjd', short: 'RJD', name: 'Rashtriya Janata Dal', symbol: '🏮', leaders: ['Tejashwi Yadav', 'Lalu Prasad Yadav'] },
  { id: 'aiadmk', short: 'AIADMK', name: 'All India Anna Dravida Munnetra Kazhagam', symbol: '🍃', leaders: ['Edappadi K. Palaniswami'] },
  { id: 'cpim', short: 'CPI(M)', name: 'Communist Party of India (Marxist)', symbol: '', leaders: ['Pinarayi Vijayan', 'M. A. Baby'] },
  { id: 'ssubt', short: 'Shiv Sena (UBT)', name: 'Shiv Sena (Uddhav Balasaheb Thackeray)', symbol: '🔥', leaders: ['Uddhav Thackeray', 'Aaditya Thackeray'] },
  { id: 'ss', short: 'Shiv Sena', name: 'Shiv Sena', symbol: '🏹', leaders: ['Eknath Shinde'] },
  { id: 'ncpsp', short: 'NCP (SP)', name: 'Nationalist Congress Party (Sharadchandra Pawar)', symbol: '🎺', leaders: ['Sharad Pawar', 'Supriya Sule'] },
  { id: 'ncp', short: 'NCP', name: 'Nationalist Congress Party', symbol: '⏰', leaders: [] },
  { id: 'jmm', short: 'JMM', name: 'Jharkhand Mukti Morcha', symbol: '🏹', leaders: ['Hemant Soren'] },
  { id: 'ysrcp', short: 'YSRCP', name: 'YSR Congress Party', symbol: '🪭', leaders: ['Y. S. Jagan Mohan Reddy'] },
  { id: 'brs', short: 'BRS', name: 'Bharat Rashtra Samithi', symbol: '🚗', leaders: ['K. Chandrashekar Rao', 'K. T. Rama Rao'] },
  { id: 'bjd', short: 'BJD', name: 'Biju Janata Dal', symbol: '🐚', leaders: ['Naveen Patnaik'] },
];

// Choices that keep the quiz generic.
export const neutralChoices = [
  { id: 'other', label: ['Koi aur party', 'Another party'], emoji: '🗳️' },
  { id: 'nota', label: ['Kisi ko nahi (NOTA)', 'None of them (NOTA)'], emoji: '🙅' },
  { id: 'secret', label: ['Batana nahi hai 🤐', 'Rather not say 🤐'], emoji: '🤫' },
];

// "Apni party banao": the player invents a party and puts any name (their own, a friend's) as leader.
// Like everything else here, it lives only in memory and never appears on results or share cards.
export const customSymbols = ['🎉', '🦁', '🥭', '☕', '🛺', '🪁', '🌶️', '🐐'];
export const CUSTOM_NAME_MAX = 30;
export const cleanName = (value) => String(value ?? '').replace(/[<>{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, CUSTOM_NAME_MAX);

export function findParty(id, preference = null) {
  if (id === 'custom' && preference?.custom) {
    return { id: 'custom', short: preference.custom.party, name: preference.custom.party, symbol: preference.custom.symbol, leaders: [] };
  }
  return parties.find((party) => party.id === id) || null;
}
export const initials = (name) => name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase();

// Builds the words that get dropped into questions. Falls back to generic wording when nothing specific was chosen.
// lang: 0 = Hinglish, 1 = English
export function personalWords(preference, lang) {
  const party = preference?.partyId ? findParty(preference.partyId, preference) : null;
  const leader = party && preference.leader ? preference.leader : null;
  const generic = lang === 0
    ? { party: 'tumhari favourite party', Party: 'Tumhari favourite party', leader: 'tumhare favourite leader', Leader: 'Tumhare favourite leader' }
    : { party: 'your favourite party', Party: 'Your favourite party', leader: 'your favourite leader', Leader: 'Your favourite leader' };
  const otherParty = preference?.partyId === 'other' ? (lang === 0 ? 'tumhari party' : 'your party') : null;
  const partyWord = party ? party.short : otherParty || generic.party;
  const PartyWord = party ? party.short : otherParty ? (lang === 0 ? 'Tumhari party' : 'Your party') : generic.Party;
  return {
    party: partyWord,
    Party: PartyWord,
    leader: leader || generic.leader,
    Leader: leader || generic.Leader,
  };
}

export function fillTokens(text, words) {
  return text.replace(/\{(party|Party|leader|Leader)\}/g, (_, key) => words[key]);
}
