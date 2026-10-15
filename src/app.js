// When you change any file under src/, bump the ?v= value here, in scoring.js and in index.html
// (tests/scoring.test.js checks they all match) so returning visitors never mix old and new files.
import { englishQuestions, questions } from './questions.js?v=2026-10-20';
import { archetypes, chances, getResult, rankHabits } from './scoring.js?v=2026-10-20';
import { cardKicker, personalResult, shareFlavour } from './personal.js?v=2026-10-20';
import { MIN_TOTAL_FOR_CHART, SLICE_ORDER, fetchStats, percentages, recordResult } from './stats.js?v=2026-10-20';
import { CUSTOM_NAME_MAX, cleanName, customSymbols, fillTokens, findParty, initials, neutralChoices, parties, personalWords } from './parties.js?v=2026-10-20';

// Public address used in share messages and on result cards.
const SITE_URL = 'https://andhbhaktyachamcha.in';
const INSTAGRAM_URL = 'https://www.instagram.com/andhbhakt_ya_chamcha';

const config = {
  brand: 'Andhbhakt Ya Chamcha?',
  url: SITE_URL || window.location.origin,
};

const colours = {
  jamun: '#2a0a3b', chalk: '#fff7fb', haldi: '#ffc531', rani: '#cf0a6c',
  andhbhakt: '#ff7eb6', chamcha: '#ffc531', factChecker: '#3fd6b4', spectator: '#ff8a5c', manifesto: '#b9a3ff', independent: '#6fd3ff',
};

// Privacy-safe counting through the Google Analytics tag already on the page.
// ONLY these event names, and never answers, results, party or leader. tests/scoring.test.js enforces this.
const TRACKED_EVENTS = ['quiz_start', 'team_pick', 'quiz_complete', 'share', 'instagram_click'];
function track(name, params = {}) {
  if (!TRACKED_EVENTS.includes(name)) return;
  try { window.gtag?.('event', name, params); } catch { /* analytics blocked or not loaded */ }
}

const app = document.querySelector('#app');
let answers = [];
let currentQuestion = 0;
let result = null;
let advancing = false;
// The whole site is Hinglish. English copy is kept in the code (t() second argument, englishQuestions)
// so an English mode can be switched back on later by setting this to 'english'.
let language = 'hinglish';
let view = 'landing';
// Party/leader picked before the quiz. Kept only in this variable: never scored, stored, sent to analytics or shown on results.
let preference = null;
let resumeQuestion = null;

const optionLetter = (index) => String.fromCharCode(65 + index);
const shortTitle = (archetype) => archetype.title.replace(': ON', '');
const displayUrl = () => config.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
const activeQuestions = () => language === 'english' ? englishQuestions : questions;
const L = () => (language === 'english' ? 1 : 0);
const t = (hinglish, english) => (language === 'english' ? english : hinglish);
const chosenParty = () => (preference?.partyId ? findParty(preference.partyId, preference) : null);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const avatarText = (name) => initials(name) || '🙂';

function languageToggle() {
  return `<div class="language-toggle" role="group" aria-label="Question language"><span>Language</span><button class="${language === 'hinglish' ? 'active' : ''}" data-language="hinglish" aria-pressed="${language === 'hinglish'}">Hinglish</button><button class="${language === 'english' ? 'active' : ''}" data-language="english" aria-pressed="${language === 'english'}">English</button></div>`;
}

function bindLanguageToggle() {
  app.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => {
    language = button.dataset.language;
    ({ landing: renderLanding, party: renderParty, leader: renderLeader, custom: renderCustomParty, quiz: renderQuiz })[view]?.();
  }));
}

function setPage(name) {
  view = name;
  document.body.classList.toggle('is-landing', name === 'landing');
  window.scrollTo({ top: 0 });
}

function renderLanding() {
  setPage('landing');
  const fan = ['andhbhakt', 'chamcha', 'factChecker'].map((id) => archetypes[id]);
  app.innerHTML = `
    <div class="landing">
      <section class="hero-band">
        <div class="hero page-width">
          <div>
            <h1><span>Andhbhakt Ya</span><span>Chamcha?</span></h1>
            <p class="hero-lede">${t('Har group chat mein ek Andhbhakt hota hai, ek Chamcha. Kahin woh tum toh nahi? 👀', 'Every group chat has one Andhbhakt and one Chamcha. Is it you? 👀')}</p>
            <button class="button button-primary button-big" data-action="start">${t('Pata karo 👀', 'Find out 👀')}</button>
            <p class="oath"><span aria-hidden="true">🤚</span> <em>"Jo kahunga sach kahunga, sach ke siwa kuch nahi kahunga."</em><small>${t('Haath dil pe, phone haath mein. 📱😂', 'Hand on heart, phone in hand. 📱😂')}</small></p>
            <p class="hero-note">${t('2 minute. Koi login nahi. Kuch save nahi hota.', '2 minutes. No login. Nothing is saved.')}</p>
          </div>
          <div class="ticket-stack" aria-hidden="true">
            ${fan.map((a) => `<div class="ticket c-${a.id}"><div class="ticket-emoji">${a.emoji}</div><h3>${shortTitle(a)}</h3><p>${a.subtitle}</p></div>`).join('')}
            <div class="stamp">Tumhara<br>result?</div>
          </div>
        </div>
      </section>

      <section class="scene-stats page-width" aria-labelledby="stats-title" data-stats hidden></section>

      <section class="steps page-width" aria-labelledby="steps-title">
        <h2 id="steps-title">${t('Khelna simple hai', 'How it works')}</h2>
        <ol>
          <li><strong>${t('Party chuno, ya apni bana lo', 'Pick a party, or make your own')}</strong><p>${t('Dost ko supreme leader bana do. Koi rok nahi raha. 😄', 'Make your friend the supreme leader. Nobody is stopping you. 😄')}</p></li>
          <li><strong>${t('7 sawaal, sach sach', '7 questions, be honest')}</strong><p>${t('Family WhatsApp se lekar TV debate tak.', 'From family WhatsApp to TV debates.')}</p></li>
          <li><strong>${t('Result dost ko bhejo', 'Send your result')}</strong><p>${t('Phir dekho kaun appeal karta hai. 😂', 'Then see who files an appeal. 😂')}</p></li>
        </ol>
      </section>

      <section class="results-intro page-width" aria-labelledby="results-title">
        <h2 id="results-title">${t('6 type ke log. Tum kaunse?', '6 kinds of people. Which one are you?')}</h2>
        <p>${t('Har group chat mein milte hain.', 'You will find them in every group chat.')}</p>
        <div class="result-tiles">
          ${Object.values(archetypes).map((a) => `<article class="result-tile c-${a.id}"><div class="tile-emoji" aria-hidden="true">${a.emoji}</div><div><h3>${shortTitle(a)}</h3><p>${a.subtitle}</p></div></article>`).join('')}
        </div>
        <div class="habit-note">
          <div class="note-emoji" aria-hidden="true">🤝</div>
          <div><strong>${t('Party nahi, aadat.', 'Habits, not parties.')}</strong><p>${t('Andhbhakt aur Chamcha kisi bhi party mein mil jaate hain. Quiz aadat pakadta hai, party nahi.', 'Andhbhakts and Chamchas exist in every party. The quiz looks at habits, not parties.')}</p></div>
        </div>
      </section>

      <section class="landing-cta page-width">
        <h2>${t('Toh ho jaaye?', 'Shall we?')}</h2>
        <button class="button button-primary button-big" data-action="start">${t('Quiz shuru karo', 'Start the quiz')}</button>
      </section>
    </div>
  `;
  bindLanguageToggle();
  app.querySelectorAll('[data-action="start"]').forEach((button) => button.addEventListener('click', startQuiz));
  loadLandingStats();
}


const privacyLine = () => t(
  'Score mein count nahi hota, kahin save bhi nahi hota. Bas sawaal tumhari team ke hisaab se aayenge.',
  'Not scored, never saved. It just makes the questions about your team.'
);

function renderParty() {
  setPage('party');
  const current = preference?.partyId;
  app.innerHTML = `
    <section class="pick-shell page-width" aria-labelledby="pick-title">
      <div class="quiz-top"><span>${t('Shuru karne se pehle', 'Before we start')}</span><button class="text-button" data-action="home">${t('Band karo', 'Exit')}</button></div>
      <div class="pick-head">
        <div class="pick-emoji" aria-hidden="true">🗳️</div>
        <h1 id="pick-title">${t('Aaj chunaav ho, toh vote kisko doge?', 'If the election were today, who gets your vote?')}</h1>
        <p class="pick-note"><span aria-hidden="true">🔒</span> ${privacyLine()}</p>
      </div>
      <div class="party-grid" role="list">
        <button class="party-card custom-card ${current === 'custom' ? 'selected' : ''}" role="listitem" data-action="custom-party">
          <span class="party-symbol" aria-hidden="true">${current === 'custom' ? escapeHtml(preference.custom.symbol) : '➕'}</span>
          <span class="party-short">${current === 'custom' ? escapeHtml(preference.custom.party) : t('Apni party banao', 'Create your own party')}</span>
          <span class="party-name">${t('Leader koi bhi: tum, dost, mummy 😄', 'Any leader: you, a friend, your mom 😄')}</span>
        </button>
        ${parties.map((party) => `
          <button class="party-card ${current === party.id ? 'selected' : ''}" role="listitem" data-party="${party.id}" aria-pressed="${current === party.id}">
            <span class="party-symbol ${party.symbol ? '' : 'text-symbol'}" aria-hidden="true">${party.symbol || party.short.slice(0, 3)}</span>
            <span class="party-short">${party.short}</span>
            <span class="party-name">${party.name}</span>
          </button>`).join('')}
      </div>
      <div class="neutral-row">
        ${neutralChoices.map((choice) => `<button class="neutral-chip ${current === choice.id ? 'selected' : ''}" data-party="${choice.id}" aria-pressed="${current === choice.id}"><span aria-hidden="true">${choice.emoji}</span> ${choice.label[L()]}</button>`).join('')}
      </div>
      <p class="pick-small">${t('Symbols sirf emoji hain, asli logo nahi. Ye site kisi party se judi nahi hai.', 'Symbols are just emoji, not real logos. This site is not linked to any party.')}</p>
    </section>
  `;
  bindLanguageToggle();
  app.querySelector('[data-action="home"]').addEventListener('click', renderLanding);
  app.querySelector('[data-action="custom-party"]').addEventListener('click', renderCustomParty);
  app.querySelectorAll('[data-party]').forEach((button) => button.addEventListener('click', () => {
    const partyId = button.dataset.party;
    track('team_pick', { team: findParty(partyId) ? 'real_party' : 'no_party' });
    const party = findParty(partyId);
    preference = { partyId, leader: preference?.partyId === partyId ? preference.leader : null };
    if (party && party.leaders.length) renderLeader();
    else { preference.leader = null; beginQuestions(); }
  }));
  const title = app.querySelector('#pick-title'); title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true });
}


function renderCustomParty() {
  setPage('custom');
  const draft = preference?.partyId === 'custom' ? preference.custom : { party: '', leader: '', symbol: customSymbols[0] };
  let symbol = draft.symbol;
  app.innerHTML = `
    <section class="pick-shell page-width" aria-labelledby="pick-title">
      <div class="quiz-top"><button class="text-button" data-action="back-party">${t('Asli parties dekho', 'See real parties')}</button><button class="text-button" data-action="home">${t('Band karo', 'Exit')}</button></div>
      <div class="pick-head">
        <div class="pick-emoji" aria-hidden="true" data-preview-symbol>${escapeHtml(symbol)}</div>
        <h1 id="pick-title">${t('Apni party banao 🚀', 'Launch your own party 🚀')}</h1>
        <p class="pick-note"><span aria-hidden="true">🔒</span> ${t('Naam kuch bhi rakho. Ye sirf sawaalon mein dikhega, kahin save ya share nahi hoga.', 'Use any name. It only appears in the questions and is never saved or shared.')}</p>
      </div>
      <div class="custom-form">
        <label for="custom-party">${t('Party ka naam', 'Party name')}</label>
        <input id="custom-party" type="text" maxlength="${CUSTOM_NAME_MAX}" autocomplete="off" placeholder="${t('Jaise: Chai Pe Charcha Party', 'e.g. Chai Pe Charcha Party')}" value="${escapeHtml(draft.party)}">
        <label for="custom-leader">${t('Supreme leader kaun?', 'Who is the supreme leader?')}</label>
        <input id="custom-leader" type="text" maxlength="${CUSTOM_NAME_MAX}" autocomplete="off" placeholder="${t('Tumhara naam, dost ka naam, kuch bhi', 'Your name, a friend, anyone')}" value="${escapeHtml(draft.leader)}">
        <p class="custom-label" id="symbol-label">${t('Chunaav chinh chuno', 'Pick a party symbol')}</p>
        <div class="symbol-row" role="radiogroup" aria-labelledby="symbol-label">
          ${customSymbols.map((emoji) => `<button class="symbol-choice ${emoji === symbol ? 'selected' : ''}" role="radio" aria-checked="${emoji === symbol}" data-symbol="${emoji}">${emoji}</button>`).join('')}
        </div>
        <button class="button button-primary button-big" data-action="launch">${t('Party launch karo, quiz shuru 🚀', 'Launch party, start quiz 🚀')}</button>
      </div>
    </section>
  `;
  bindLanguageToggle();
  app.querySelector('[data-action="home"]').addEventListener('click', renderLanding);
  app.querySelector('[data-action="back-party"]').addEventListener('click', renderParty);
  app.querySelectorAll('[data-symbol]').forEach((button) => button.addEventListener('click', () => {
    symbol = button.dataset.symbol;
    app.querySelectorAll('[data-symbol]').forEach((other) => { const on = other === button; other.classList.toggle('selected', on); other.setAttribute('aria-checked', String(on)); });
    app.querySelector('[data-preview-symbol]').textContent = symbol;
  }));
  const launch = () => {
    const party = cleanName(app.querySelector('#custom-party').value) || t('Meri Party', 'My Party');
    const leader = cleanName(app.querySelector('#custom-leader').value);
    preference = { partyId: 'custom', leader: leader || null, custom: { party, leader, symbol } };
    track('team_pick', { team: 'custom' });
    beginQuestions();
  };
  app.querySelector('[data-action="launch"]').addEventListener('click', launch);
  app.querySelectorAll('.custom-form input').forEach((input) => input.addEventListener('keydown', (event) => { if (event.key === 'Enter') launch(); }));
  app.querySelector('#custom-party').focus({ preventScroll: true });
}

function renderLeader() {
  const party = chosenParty();
  if (!party) { beginQuestions(); return; }
  setPage('leader');
  app.innerHTML = `
    <section class="pick-shell page-width" aria-labelledby="pick-title">
      <div class="quiz-top"><button class="text-button" data-action="back-party">${t('Party badlo', 'Change party')}</button><button class="text-button" data-action="home">${t('Band karo', 'Exit')}</button></div>
      <div class="pick-head">
        <div class="pick-emoji ${party.symbol ? '' : 'party-badge-big'}" aria-hidden="true">${party.symbol || party.short.slice(0, 3)}</div>
        <h1 id="pick-title">${t(`${party.short} mein tumhara favourite leader kaun?`, `Your favourite ${party.short} leader?`)}</h1>
        <p class="pick-note"><span aria-hidden="true">🔒</span> ${privacyLine()}</p>
      </div>
      <div class="leader-grid" role="list">
        ${party.leaders.map((name) => `
          <button class="leader-card ${preference.leader === name ? 'selected' : ''}" role="listitem" data-leader="${name}" aria-pressed="${preference.leader === name}">
            <span class="leader-avatar" aria-hidden="true">${initials(name)}</span>
            <span class="leader-name">${name}</span>
          </button>`).join('')}
        <button class="leader-card leader-none" role="listitem" data-leader="">
          <span class="leader-avatar" aria-hidden="true">${party.symbol || '🗳️'}</span>
          <span class="leader-name">${t('Party pasand hai, koi ek leader nahi', 'I like the party, not one leader')}</span>
        </button>
      </div>
    </section>
  `;
  bindLanguageToggle();
  app.querySelector('[data-action="home"]').addEventListener('click', renderLanding);
  app.querySelector('[data-action="back-party"]').addEventListener('click', renderParty);
  app.querySelectorAll('[data-leader]').forEach((button) => button.addEventListener('click', () => {
    preference.leader = button.dataset.leader || null;
    beginQuestions();
  }));
}

function teamChip() {
  const party = chosenParty();
  if (!party && preference?.partyId !== 'other') return '';
  const label = party ? escapeHtml(`${party.symbol ? `${party.symbol} ` : ''}${party.short}${preference.leader ? ` · ${preference.leader}` : ''}`) : t('🗳️ Tumhari party', '🗳️ Your party');
  return `<div class="team-chip"><span>${t('Tumhari team:', 'Your team:')} <strong>${label}</strong></span><button class="text-button" data-action="change-team">${t('Badlo', 'Change')}</button></div>`;
}

function sceneMarkup(question) {
  const party = chosenParty();
  let sticker = '';
  if (question.about === 'leader' && party && preference.leader) {
    sticker = `<div class="scene-sticker leader-sticker"><span class="leader-avatar small">${escapeHtml(avatarText(preference.leader))}</span><span>${escapeHtml(preference.leader)}</span></div>`;
  } else if (question.about && party) {
    sticker = `<div class="scene-sticker party-sticker"><span class="party-symbol small ${party.symbol ? '' : 'text-symbol'}">${escapeHtml(party.symbol || party.short.slice(0, 3))}</span><span>${escapeHtml(party.short)}</span></div>`;
  }
  return `
    <div class="scene c-${question.scene.bg} ${sticker ? 'has-sticker' : ''}" aria-hidden="true">
      <span class="scene-main">${question.scene.main}</span>
      ${question.scene.stickers.map((emoji, index) => `<span class="scene-float f${index + 1}">${emoji}</span>`).join('')}
      ${sticker}
    </div>`;
}

function renderQuiz() {
  setPage('quiz');
  const raw = activeQuestions()[currentQuestion];
  const words = Object.fromEntries(Object.entries(personalWords(preference, L())).map(([key, value]) => [key, escapeHtml(value)]));
  const question = { ...raw, prompt: fillTokens(raw.prompt, words), options: raw.options.map((option) => ({ ...option, text: fillTokens(option.text, words) })) };
  const selected = answers[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;
  app.innerHTML = `
    <section class="quiz-shell page-width" aria-labelledby="question-title">
      <div class="quiz-top"><span>${language === 'english' ? 'Question' : 'Sawaal'} ${currentQuestion + 1} / ${activeQuestions().length}</span><button class="text-button" data-action="home">${language === 'english' ? 'Exit' : 'Band karo'}</button></div>
      <div class="progress-dots" role="progressbar" aria-valuemin="1" aria-valuemax="${activeQuestions().length}" aria-valuenow="${currentQuestion + 1}" aria-label="Quiz progress">
        ${activeQuestions().map((_, index) => `<i class="${index < currentQuestion ? 'done' : index === currentQuestion ? 'current' : ''}"></i>`).join('')}
      </div>
      ${teamChip()}
      <div class="question-card">
        ${sceneMarkup(question)}
        <p class="question-kicker">${question.emoji} ${question.title}</p>
        <h1 id="question-title">${question.prompt}</h1>
        <fieldset class="options">
          <legend class="sr-only">${language === 'english' ? 'Choose one answer' : 'Ek jawaab chuno'}</legend>
          ${question.options.map((option, index) => `<button class="option ${selected === index ? 'selected' : ''}" data-option="${index}" aria-pressed="${selected === index}"><span class="option-letter" aria-hidden="true">${optionLetter(index)}</span><span>${option.text}</span></button>`).join('')}
        </fieldset>
        <div class="quiz-actions">
          <button class="text-button" data-action="back" ${currentQuestion === 0 ? 'hidden' : ''}>${language === 'english' ? 'Previous question' : 'Pichhla sawaal'}</button>
          ${selected !== undefined
            ? `<button class="button button-primary" data-action="next">${isLast ? (language === 'english' ? 'Show my result' : 'Result dikhao') : (language === 'english' ? 'Next question' : 'Agla sawaal')}</button>`
            : `<span class="quiz-hint">${language === 'english' ? 'Tap an answer' : 'Jawaab pe tap karo'}</span>`}
        </div>
      </div>
    </section>
  `;
  bindLanguageToggle();
  app.querySelectorAll('[data-option]').forEach((button) => button.addEventListener('click', () => chooseOption(Number(button.dataset.option))));
  app.querySelector('[data-action="back"]').addEventListener('click', () => { currentQuestion -= 1; renderQuiz(); focusQuestion(); });
  app.querySelector('[data-action="next"]')?.addEventListener('click', goForward);
  app.querySelector('[data-action="home"]').addEventListener('click', renderLanding);
  app.querySelector('[data-action="change-team"]')?.addEventListener('click', () => { resumeQuestion = currentQuestion; renderParty(); });
}

function focusQuestion() { app.querySelector('#question-title')?.setAttribute('tabindex', '-1'); app.querySelector('#question-title')?.focus({ preventScroll: true }); }

function chooseOption(index) {
  if (advancing) return;
  answers[currentQuestion] = index;
  app.querySelectorAll('[data-option]').forEach((button) => {
    const isSelected = Number(button.dataset.option) === index;
    button.classList.toggle('selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
  advancing = true;
  setTimeout(() => { advancing = false; goForward(); }, 320);
}

function goForward() {
  if (answers[currentQuestion] === undefined) return;
  if (currentQuestion === questions.length - 1) { result = getResult(answers); track('quiz_complete'); renderResult(); return; }
  currentQuestion += 1;
  renderQuiz();
  focusQuestion();
}


// ---------- Live "Ab tak ka scene" chart (anonymous result-type counts, see src/stats.js) ----------

const sceneCaption = {
  andhbhakt: ['Andhbhakt majority mein hain. 🙈 Aankhein kholo, quiz khelo.', 'Andhbhakts are winning. 🙈 Open your eyes and play.'],
  chamcha: ['Chamche aage chal rahe hain. 🥄 Kahin tum bhi toh nahi?', 'The Chamchas are ahead. 🥄 Are you one too?'],
  independent: ['Sab Independent Thinker nikal rahe hain. 🧠 Sach mein? 😏', 'Everyone is an Independent Thinker. 🧠 Really? 😏'],
  spectator: ['Popcorn party sabse badi hai. 🍿 Debate kaun karega?', 'Team Popcorn is the biggest. 🍿 Who will debate?'],
  factChecker: ['Fact-check wale jeet rahe hain. 🔎 Source: yahi chart.', 'Fact-checkers are winning. 🔎 Source: this chart.'],
  manifesto: ['Auditor log aage hain. 📋 Neta log, dhyaan do.', 'The auditors lead. 📋 Netas, take note.'],
};

function donutSvg(counts, total, top) {
  const size = 240; const cx = size / 2; const cy = size / 2; const outer = 112; const inner = 62;
  let angle = -Math.PI / 2;
  const point = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  const slices = SLICE_ORDER.filter((id) => counts[id] > 0).map((id) => {
    const share = counts[id] / total;
    const start = angle; const end = angle + share * Math.PI * 2; angle = end;
    const large = end - start > Math.PI ? 1 : 0;
    const mid = (start + end) / 2;
    const path = share >= 0.999
      ? `M ${point(outer, -Math.PI / 2)} A ${outer} ${outer} 0 1 1 ${point(outer, Math.PI * 1.5 - 0.0001)} L ${point(inner, Math.PI * 1.5 - 0.0001)} A ${inner} ${inner} 0 1 0 ${point(inner, -Math.PI / 2)} Z`
      : `M ${point(outer, start)} A ${outer} ${outer} 0 ${large} 1 ${point(outer, end)} L ${point(inner, end)} A ${inner} ${inner} 0 ${large} 0 ${point(inner, start)} Z`;
    const label = share >= 0.07 ? `<text x="${point((outer + inner) / 2, mid).split(' ')[0]}" y="${point((outer + inner) / 2, mid).split(' ')[1]}" class="donut-emoji" text-anchor="middle" dominant-baseline="central">${archetypes[id].emoji}</text>` : '';
    return `<g class="donut-slice"><path d="${path}" fill="var(--c-${id})"><title>${shortTitle(archetypes[id])}: ${Math.round(share * 100)}%</title></path>${label}</g>`;
  }).join('');
  return `<svg class="donut" viewBox="0 0 ${size} ${size}" role="img" aria-label="${t('Ab tak ke results ka chart', 'Chart of results so far')}">${slices}
    <text x="${cx}" y="${cy}" class="donut-centre" text-anchor="middle" dominant-baseline="central">${archetypes[top].emoji}</text></svg>`;
}

async function loadLandingStats() {
  const box = app.querySelector('[data-stats]');
  if (!box) return;
  let stats;
  try { stats = await fetchStats(); } catch { return; } // service down: keep the section hidden
  if (!box.isConnected) return;
  const { counts, total } = stats;
  if (total < MIN_TOTAL_FOR_CHART) return; // stays hidden until there is enough real data
  {
    const pct = percentages(counts, total);
    const top = SLICE_ORDER.reduce((best, id) => (counts[id] > counts[best] ? id : best), SLICE_ORDER[0]);
    box.innerHTML = `
      <div class="stats-panel">
        <div class="stats-head">
          <h2 id="stats-title">${t('Ab tak ka scene 📊', 'The scene so far 📊')}</h2>
          <p class="stats-caption">${sceneCaption[top][L()]}</p>
        </div>
        <div class="stats-body">
          ${donutSvg(counts, total, top)}
          <ul class="stats-legend">
            ${SLICE_ORDER.map((id) => `<li><span class="legend-swatch c-${id}" aria-hidden="true">${archetypes[id].emoji}</span><span class="legend-name">${shortTitle(archetypes[id])}</span><strong>${pct[id]}%</strong></li>`).join('')}
          </ul>
        </div>
        <div class="stats-foot">
          <button class="button button-primary" data-action="start">${t('Main kahan hoon? 👀', 'Where do I fit? 👀')}</button>
          <p>${t('Asli results, live. Scientific nahi, bas mazaak.', 'Real results, live. Not science, just fun.')}</p>
        </div>
      </div>`;
  }
  box.querySelectorAll('[data-action="start"]').forEach((button) => button.addEventListener('click', startQuiz));
  box.hidden = false;
}

async function showResultStat(archetype) {
  const line = app.querySelector('[data-result-stat]');
  let stats;
  try { stats = await recordResult(archetype.id); } catch { return; }
  if (!line?.isConnected || stats.total < MIN_TOTAL_FOR_CHART) return;
  const pct = percentages(stats.counts, stats.total)[archetype.id];
  line.textContent = t(`Ab tak har 100 mein se ${pct} ${shortTitle(archetype)} nikle. Tum akele nahi ho. 😌`, `${pct}% of players so far got ${shortTitle(archetype)}. You are not alone. 😌`);
  line.hidden = false;
}

function renderResult() {
  setPage('result');
  const { archetype, runnerUp, counts, evidence } = result;
  const breakdown = rankHabits(counts, evidence).filter((habit) => counts[habit] > 0).map((habit) => `
    <li><span>${archetypes[habit].emoji} ${shortTitle(archetypes[habit])}</span><span class="habit-bar" aria-hidden="true"><i class="c-${habit}" style="width:${Math.round((counts[habit] / chances[habit]) * 100)}%"></i></span><span>${counts[habit]}/${chances[habit]}</span></li>`).join('');
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText())}`;
  const kicker = cardKicker(preference, L());
  const canShareImage = canShareFiles();
  app.innerHTML = `
    <section class="result-stage c-${archetype.id}">
      <div class="page-width">
        <article class="result-card" aria-labelledby="result-title">
          <div class="rc-top"><span class="rc-brand">Andhbhakt Ya Chamcha?</span><span class="rc-stamp" aria-hidden="true">Unofficial<br>verdict</span></div>
          <div class="result-emoji" aria-hidden="true">${archetype.emoji}</div>
          <p class="rc-kicker">${kicker ? escapeHtml(kicker.replace(/:$/, '')) : t('Mera result', 'My result')}</p>
          <h1 id="result-title" tabindex="-1">${archetype.title}</h1>
          <p class="rc-roast">“${archetype.description}”</p>
          <p class="rc-url">andhbhaktyachamcha.in</p>
        </article>
        <p class="result-stat" data-result-stat hidden></p>
        <div class="result-actions">
          ${canShareImage
            ? `<button class="button button-primary button-big" data-action="share-card">${t('Story pe lagao 📲', 'Post to Story 📲')}</button>`
            : `<button class="button button-primary button-big" data-action="download-story">${t('Image save karo 📲', 'Save image 📲')}</button>`}
          <div class="result-actions-row">
            <a class="button button-whatsapp" href="${waLink}" target="_blank" rel="noopener" data-track="whatsapp">${t('WhatsApp pe bhejo', 'Send on WhatsApp')}</a>
            <button class="button button-plain" data-action="challenge">${t('Dost ko bhejo 😏', 'Dare a friend 😏')}</button>
          </div>
        </div>
      </div>
    </section>

    <section class="result-more page-width">
      ${teamVerdict(archetype)}
      <details class="result-details">
        <summary>${t('Thoda aur jaano', 'More about your result')}</summary>
        <p class="rd-verdict">${archetype.verdict}</p>
        ${runnerUp ? `<p class="rd-runner">${t('Thoda sa', 'A bit of')} ${runnerUp.emoji} ${shortTitle(runnerUp)} ${t('bhi.', 'too.')}</p>` : ''}
        <div class="traits">
          <article class="trait-good"><h2>Superpower</h2><p>${archetype.superpower}</p></article>
          <article class="trait-blind"><h2>${t('Kamzori', 'Blind spot')}</h2><p>${archetype.weakness}</p></article>
        </div>
        <div class="habit-breakdown">
          <h2>${t('Kaunsi aadat kitni baar', 'Your answers by habit')}</h2>
          <ul>${breakdown}</ul>
          <p class="rd-method">${t('Har jawaab ek aadat se juda hai. Jo aadat tumne sabse zyada chuni (mile hue mauke ke hisaab se), wahi result. Scientific nahi, bas mazaak.', 'Each answer maps to a habit. The habit you picked most (for the chances it had) is your result. Not science, just fun.')}</p>
        </div>
      </details>
      <div class="result-links">
        <button class="text-button" data-action="restart">${t('Dobara khelo', 'Play again')}</button>
        <a class="text-button" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" data-track="instagram">${t('Aise aur memes: Instagram', 'More memes on Instagram')}</a>
        <span class="result-downloads">${t('Image save karo:', 'Save image:')} <button class="text-button" data-action="download-story">${t('Story size', 'Story size')}</button> <button class="text-button" data-action="download-feed">${t('Post size', 'Post size')}</button></span>
      </div>
      <p class="result-note">${t('Sirf mazaak ke liye. Tumhare jawaab kahin save nahi hote.', 'Just for fun. Your answers are never saved.')}</p>
    </section>
  `;
  app.querySelector('h1').focus({ preventScroll: true });
  showResultStat(archetype);
  app.querySelector('[data-action="share-card"]')?.addEventListener('click', shareCard);
  app.querySelector('[data-action="challenge"]').addEventListener('click', shareChallenge);
  app.querySelectorAll('[data-action="download-story"]').forEach((button) => button.addEventListener('click', () => downloadCard('story')));
  app.querySelector('[data-action="download-feed"]').addEventListener('click', () => downloadCard('feed'));
  app.querySelector('[data-action="restart"]').addEventListener('click', restart);
  app.querySelectorAll('[data-track]').forEach((link) => link.addEventListener('click', () => track(link.dataset.track === 'instagram' ? 'instagram_click' : 'share', link.dataset.track === 'instagram' ? {} : { method: 'whatsapp' })));
}

function teamVerdict(archetype) {
  const personal = personalResult(archetype.id, preference, L());
  if (!personal) return '';
  return `
      <div class="team-verdict">
        <div class="team-badge" aria-hidden="true">${escapeHtml(personal.symbol)}</div>
        <div>
          <p class="team-label">${escapeHtml(personal.team)}${personal.leader ? ` · ${escapeHtml(personal.leader)}` : ''} ${t('special', 'special')}</p>
          <p class="team-line">${escapeHtml(personal.line)}</p>
          ${personal.extra ? `<p class="team-extra">${escapeHtml(personal.extra)}</p>` : ''}
        </div>
      </div>`;
}

function shareText() {
  const { archetype } = result;
  const flavour = shareFlavour(preference, L());
  return `${flavour ? `${flavour}\n` : ''}Mera result: ${archetype.emoji} *${archetype.title}* 😭\n"${archetype.description}"\n\nTumhara kya aata hai? 👉 ${config.url}`;
}
function challengeText() { return `Ek quiz kar ke dekh 😏\nMera ${result.archetype.emoji} ${shortTitle(result.archetype)} aaya. Tera kya aata hai?\n👉 ${config.url}`; }

async function shareOrCopy(text, copiedMessage) {
  if (navigator.share) {
    try { await navigator.share({ title: config.brand, text }); return; } catch (error) { if (error.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(text); showToast(copiedMessage); } catch { showToast('Copy nahi ho paya. Link: ' + displayUrl()); }
}
const shareChallenge = () => { track('share', { method: 'challenge' }); return shareOrCopy(challengeText(), t('Message copy ho gaya. Dost ko paste karo.', 'Message copied. Paste it to a friend.')); };

function showToast(message) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2800);
}

// ---------- Result card (canvas) ----------

function wrapLines(ctx, text, maxWidth) {
  const lines = []; let line = '';
  text.split(' ').forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function stickerRect(ctx, x, y, w, h, r, fill, shadow = 14) {
  ctx.fillStyle = colours.jamun; roundRect(ctx, x + shadow, y + shadow, w, h, r); ctx.fill();
  ctx.fillStyle = fill; roundRect(ctx, x, y, w, h, r); ctx.fill();
  ctx.lineWidth = 7; ctx.strokeStyle = colours.jamun; ctx.stroke();
}

// Draws lines centred on x, first baseline at y. Returns the last baseline.
function centredLines(ctx, lines, x, y, lineHeight) { lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight)); return y + (lines.length - 1) * lineHeight; }

export function drawCard(canvas, archetype, format, url, kicker = null) {
  const story = format === 'story';
  const W = 1080; const H = story ? 1920 : 1350; const pad = 80; const cx = W / 2;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  // Story layouts keep the top ~200px and bottom ~300px clear of Status/Stories overlays.
  const L = story
    ? { top: 210, emojiY: 470, r: 130, emojiFont: 140, gapKicker: 95, kicker: 46, title: 150, gapSub: 96, sub: 46, subLh: 58, gapPanel: 60, roast: 56, footer: H - 380, pill: 100, url: 54, cta: 44 }
    : { top: 165, emojiY: 330, r: 100, emojiFont: 108, gapKicker: 72, kicker: 38, title: 122, gapSub: 78, sub: 38, subLh: 48, gapPanel: 44, roast: 46, footer: H - 210, pill: 84, url: 46, cta: 38 };

  ctx.fillStyle = colours[archetype.id]; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 10; ctx.strokeStyle = colours.jamun; roundRect(ctx, 28, 28, W - 56, H - 56, 44); ctx.stroke();

  // Brand line and stamp
  ctx.fillStyle = colours.jamun; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `${story ? 54 : 46}px "Yatra One", serif`;
  ctx.fillText(config.brand, pad, L.top - (story ? 40 : 30));
  ctx.save(); ctx.translate(W - pad - 80, L.top - (story ? 60 : 44)); ctx.rotate(.21);
  ctx.strokeStyle = colours.jamun; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, 0, story ? 86 : 74, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, story ? 74 : 63, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = colours.jamun; ctx.textAlign = 'center'; ctx.font = `${story ? 28 : 24}px "Yatra One", serif`;
  ctx.fillText('Unofficial', 0, -4); ctx.fillText('verdict', 0, story ? 28 : 24);
  ctx.restore();

  // Emoji medallion
  ctx.fillStyle = colours.jamun; ctx.beginPath(); ctx.arc(cx + 12, L.emojiY + 12, L.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colours.chalk; ctx.beginPath(); ctx.arc(cx, L.emojiY, L.r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = colours.jamun; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = colours.jamun;
  ctx.font = `${L.emojiFont}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.fillText(archetype.emoji, cx, L.emojiY + 6);
  ctx.textBaseline = 'alphabetic';

  // Kicker
  let y = L.emojiY + L.r + L.gapKicker;
  ctx.font = `600 ${L.kicker}px Hind, sans-serif`;
  let kickerSize = L.kicker; const kickerText = kicker || 'Mera result:';
  for (;;) { ctx.font = `600 ${kickerSize}px Hind, sans-serif`; if (ctx.measureText(kickerText).width <= W - pad * 2 || kickerSize <= 26) break; kickerSize -= 2; }
  ctx.fillText(kickerText, cx, y);

  // Title: biggest size that fits in two lines
  let size = L.title; let lines;
  for (;;) { ctx.font = `${size}px "Yatra One", serif`; lines = wrapLines(ctx, archetype.title, W - pad * 2); if (lines.length <= 2 || size <= 64) break; size -= 6; }
  y = centredLines(ctx, lines, cx, y + size * .98, size * 1.02);

  // Subtitle
  ctx.font = `600 ${L.sub}px Hind, sans-serif`;
  y = centredLines(ctx, wrapLines(ctx, archetype.subtitle, W - pad * 2 - 40), cx, y + L.gapSub, L.subLh);

  // Footer: call to action and URL pill (fixed position)
  const pillTop = L.footer + 26;
  ctx.font = `700 ${L.cta}px Hind, sans-serif`;
  ctx.fillText('Tumhara result kya hai? 2 minute ka quiz:', cx, L.footer);
  ctx.font = `${L.url}px "Yatra One", serif`;
  const pillW = Math.min(W - pad * 2, ctx.measureText(url).width + 90);
  stickerRect(ctx, cx - pillW / 2, pillTop, pillW, L.pill, L.pill / 2, archetype.id === 'chamcha' ? colours.chalk : colours.haldi, 10);
  ctx.fillStyle = colours.jamun; ctx.fillText(url, cx, pillTop + L.pill * .68);

  // Roast panel fills the space between subtitle and footer; shrink the text if it would not fit.
  const panelTop = y + L.gapPanel; const maxBottom = L.footer - L.cta - 40;
  let roastSize = L.roast; let roast; let lh; let panelH;
  for (;;) {
    ctx.font = `${roastSize}px "Yatra One", serif`;
    roast = wrapLines(ctx, `“${archetype.description}”`, W - pad * 2 - 100);
    lh = roastSize * 1.2; panelH = roast.length * lh + roastSize * 1.4;
    if (panelTop + panelH + 14 <= maxBottom || roastSize <= 30) break;
    roastSize -= 2;
  }
  stickerRect(ctx, pad, panelTop, W - pad * 2 - 14, panelH, 36, colours.chalk);
  ctx.fillStyle = colours.jamun; ctx.font = `${roastSize}px "Yatra One", serif`;
  centredLines(ctx, roast, cx - 7, panelTop + roastSize * .7 + lh * .78, lh);
}

async function renderCard(format) {
  try { await Promise.all([document.fonts.load('60px "Yatra One"'), document.fonts.load('600 40px Hind'), document.fonts.load('700 40px Hind')]); } catch { /* fall back to system fonts */ }
  const canvas = document.createElement('canvas');
  drawCard(canvas, result.archetype, format, displayUrl(), cardKicker(preference, L()));
  return canvas;
}
const cardName = (format) => `andhbhakt-ya-chamcha-${result.archetype.id}-${format}.png`;

// Phones that support sharing files (most Android and iOS browsers) can send the card image
// straight to WhatsApp Status, Instagram Stories etc. Others fall back to download.
function canShareFiles() {
  try { return Boolean(navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })); } catch { return false; }
}

async function shareCard() {
  track('share', { method: 'story_image' });
  const canvas = await renderCard('story');
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], cardName('story'), { type: 'image/png' });
  try {
    await navigator.share({ files: [file], text: shareText() });
  } catch (error) {
    if (error.name !== 'AbortError') downloadCard('story');
  }
}

async function downloadCard(format) {
  const canvas = await renderCard(format);
  const link = document.createElement('a');
  link.download = cardName(format);
  link.href = canvas.toDataURL('image/png');
  link.click();
  track('share', { method: `download_${format}` });
  showToast(t('Image save ho gayi. Ab Story pe lagao 📲', 'Image saved. Post it to your Story 📲'));
}

function startQuiz() { answers = []; currentQuestion = 0; result = null; resumeQuestion = null; track('quiz_start'); renderParty(); }
function beginQuestions() {
  if (resumeQuestion !== null) { currentQuestion = resumeQuestion; resumeQuestion = null; }
  renderQuiz();
  focusQuestion();
}
function restart() { startQuiz(); }

renderLanding();
