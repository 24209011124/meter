// When you change any file under src/, bump the ?v= value here, in scoring.js and in index.html
// (tests/scoring.test.js checks they all match) so returning visitors never mix old and new files.
import { englishQuestions, questions } from './questions.js?v=2026-10-24';
import { archetypes, chances, getResult, rankHabits } from './scoring.js?v=2026-10-24';
import { cardKicker, personalResult, shareFlavour } from './personal.js?v=2026-10-24';
import { MIN_TOTAL_FOR_CHART, SLICE_ORDER, fetchStats, percentages, recordResult } from './stats.js?v=2026-10-24';
import { CUSTOM_NAME_MAX, cleanName, customSymbols, fillTokens, findParty, initials, neutralChoices, parties, personalWords } from './parties.js?v=2026-10-24';
import { campaignUrl, track } from './analytics.js?v=2026-10-24';
import { onScreenChange, pushScreen, replaceScreen } from './nav.js?v=2026-10-24';

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

// Analytics goes through track() in src/analytics.js, which only lets through a fixed list of
// events and values (never answers, results, party, leader or names).

const app = document.querySelector('#app');
// Per quiz run, so Back/Forward or a replay inside one run never double-counts.
let runEvents = new Set();
const trackOnce = (key, name, params) => { if (runEvents.has(key)) return; runEvents.add(key); track(name, params); };
// True while a popstate (Back/Forward) is being handled, so renders don't add new history entries.
let fromHistory = false;
// True once the player has tapped a start button in this page visit (answers etc. live in memory).
let quizActive = false;
let answers = [];
let currentQuestion = 0;
let result = null;
let advancing = false;
// Hinglish by default. The header switch flips the whole site (questions, results, share text, cards)
// at any point, even mid-quiz; answers and the party pick are kept.
let language = 'hinglish';
let customDraft = null;
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

// Localised view of a result: English mode swaps in archetype.en fields; titles stay as they are.
const loc = (archetype) => (archetype && language === 'english' ? { ...archetype, ...archetype.en } : archetype);

const headerSwitch = document.createElement('div');
headerSwitch.className = 'lang-switch';
headerSwitch.setAttribute('role', 'group');
headerSwitch.setAttribute('aria-label', 'Language / Bhasha');
document.querySelector('.site-header')?.append(headerSwitch);
const headerNote = document.querySelector('.header-note');
const footerNote = document.querySelector('.site-footer p');

function renderChrome() {
  document.documentElement.lang = language === 'english' ? 'en' : 'hi-Latn';
  headerSwitch.innerHTML = ['hinglish', 'english'].map((code) => `<button class="${language === code ? 'active' : ''}" data-language="${code}" aria-pressed="${language === code}">${code === 'hinglish' ? 'Hinglish' : 'English'}</button>`).join('');
  if (headerNote) headerNote.textContent = t('Bilkul unofficial reality check', 'A totally unofficial reality check');
  if (footerNote) footerNote.textContent = t('Independent satire. Kisi party, leader, sarkari department ya election authority se koi connection nahi.', 'Independent satire. Not linked to any party, leader, government department or election authority.');
}

headerSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('[data-language]');
  if (!button || button.dataset.language === language) return;
  if (view === 'custom') {
    customDraft = { party: app.querySelector('#custom-party')?.value || '', leader: app.querySelector('#custom-leader')?.value || '', symbol: app.querySelector('.symbol-choice.selected')?.dataset.symbol };
  }
  const scroll = window.scrollY;
  language = button.dataset.language;
  renderChrome();
  ({ landing: renderLanding, party: renderParty, leader: renderLeader, custom: renderCustomParty, quiz: renderQuiz, result: renderResult })[view]?.();
  window.scrollTo({ top: scroll });
});

function bindLanguageToggle() { /* language switching now lives in the header (renderChrome) */ }

function setPage(name, screen = name) {
  const sameScreen = history.state?.screen === screen;
  view = name;
  document.body.classList.toggle('is-landing', name === 'landing');
  if (!fromHistory) pushScreen(screen);
  if (!sameScreen) window.scrollTo({ top: 0 });
}

// Back / Forward: show the step the history entry names, using what is still in memory.
// If memory doesn't have what that step needs (e.g. after a refresh), fall back safely.
onScreenChange((screen) => {
  fromHistory = true;
  try {
    advancing = false;
    const quizReady = quizActive;
    if (screen === 'landing') renderLanding();
    else if (screen === 'party' && quizReady) renderParty();
    else if (screen === 'custom' && quizReady) renderCustomParty();
    else if (screen === 'leader' && quizReady && chosenParty()?.leaders?.length) renderLeader();
    else if (screen === 'leader' && quizReady) renderParty();
    else if (screen.startsWith('quiz-') && quizReady) {
      currentQuestion = Math.min(Number(screen.slice(5)), answers.length, questions.length - 1);
      renderQuiz(); focusQuestion();
    } else if (screen === 'result' && quizReady && result && answers.length === questions.length) renderResult();
    else if (screen === 'result' && quizReady) { currentQuestion = Math.min(answers.length, questions.length - 1); renderQuiz(); }
    else renderLanding();
  } finally {
    fromHistory = false;
  }
  // Keep the entry and what is shown in step (the fallbacks above may show a different step).
  replaceScreen(currentScreen());
});

function currentScreen() { return view === 'quiz' ? `quiz-${currentQuestion}` : view; }

function renderLanding() {
  setPage('landing');
  // Answers the three first-screen questions: what is this (headline + hook), why take it (7 / 2 / 6 facts,
  // trust line), and what happens after (the six-result board and "share it" line).
  app.innerHTML = `
    <div class="landing">
      <section class="hero-band">
        <div class="hero page-width">
          <div class="hero-main">
            <h1><span>Andhbhakt Ya</span><span>Chamcha?</span></h1>
            <p class="hero-lede">${t('Har group chat mein ek Andhbhakt hota hai, ek Chamcha. Tum kaun ho?&nbsp;👀', 'Every group chat has one Andhbhakt and one Chamcha. Which one are you?&nbsp;👀')}</p>
            <ul class="hero-facts" aria-label="${t('Quiz ke baare mein', 'About the quiz')}">
              <li><strong>7</strong> ${t('sawaal', 'questions')}</li>
              <li><strong>2</strong> ${t('minute', 'minutes')}</li>
              <li><strong>6</strong> ${t('possible results', 'possible results')}</li>
            </ul>
            <button class="button button-primary button-big" data-action="start" data-cta="hero">${t('Pata karo 👀', 'Find out 👀')}</button>
            <p class="hero-trust"><span aria-hidden="true">🤝</span> ${t('Party nahi, aadat pakadta hai. Koi login nahi. Party batana zaroori nahi.', 'It reads habits, not parties. No login. Naming a party is optional.')}</p>
          </div>
          <div class="result-board">
            <p class="board-title">${t('In 6 mein se ek result milega. Card bana ke share karo 📲', 'You get one of these 6. Share it as a card 📲')}</p>
            <ul class="board-grid">
              ${Object.values(archetypes).map(loc).map((a) => `<li class="board-tile c-${a.id}"><span class="board-emoji" aria-hidden="true">${a.emoji}</span><span class="board-name">${shortTitle(a)}</span><span class="board-sub">${a.subtitle}</span></li>`).join('')}
            </ul>
            <div class="stamp" aria-hidden="true">${t('Tumhara<br>result?', 'Your<br>result?')}</div>
          </div>
        </div>
      </section>

      <section class="friend-teaser page-width" aria-labelledby="teaser-title">
        <div class="teaser-card">
          <div class="teaser-crown" aria-hidden="true">👑</div>
          <div>
            <h2 id="teaser-title">${t('Dost ko Supreme Leader banao', 'Make your friend the Supreme Leader')}</h2>
            <p>${t('Apne dost ko party ka Supreme Leader banao. Phir dekho tum uske Andhbhakt nikle ya Chamcha 😂', 'Make a friend the Supreme Leader of your own party. Then see if you turn out to be their Andhbhakt or their Chamcha 😂')}</p>
            <button class="text-button teaser-link" data-action="start-custom" data-cta="teaser">${t('Apni party banao →', 'Create your party →')}</button>
          </div>
        </div>
      </section>

      <section class="scene-stats page-width" aria-labelledby="stats-title" data-stats hidden></section>

      <section class="landing-cta page-width">
        <h2>${t('Toh ho jaaye?', 'Shall we?')}</h2>
        <p class="oath"><span aria-hidden="true">🤚</span> <em>"Jo kahunga sach kahunga, sach ke siwa kuch nahi kahunga."</em><small>${t('Haath dil pe, phone haath mein. 📱😂', 'Hand on heart, phone in hand. 📱😂')}</small></p>
        <button class="button button-primary button-big" data-action="start" data-cta="bottom">${t('Quiz shuru karo', 'Start the quiz')}</button>
        <p class="landing-small">${t('Andhbhakt aur Chamcha har party mein milte hain. Kuch save nahi hota.', 'Andhbhakts and Chamchas exist in every party. Nothing is saved.')}</p>
      </section>
    </div>
  `;
  bindLanguageToggle();
  bindStartButtons(app);
  loadLandingStats();
}

function bindStartButtons(root) {
  root.querySelectorAll('[data-action="start"]').forEach((button) => button.addEventListener('click', () => { track('cta_click', { cta_location: button.dataset.cta }); startQuiz(); }));
  root.querySelector('[data-action="start-custom"]')?.addEventListener('click', (event) => { track('cta_click', { cta_location: event.currentTarget.dataset.cta }); startQuiz({ custom: true }); });
}


const privacyLine = () => t(
  'Score mein count nahi hota, kahin save bhi nahi hota. Bas sawaal tumhari team ke hisaab se aayenge.',
  'Not scored, never saved. It just makes the questions about your team.'
);

function renderParty() {
  setPage('party');
  const current = preference?.partyId;
  // Order matters: the one-tap skip comes first, then the fun custom party, then the compact real-party list.
  app.innerHTML = `
    <section class="pick-shell page-width" aria-labelledby="pick-title">
      <div class="quiz-top"><span>${t('Shuru karne se pehle', 'Before we start')}</span><button class="text-button" data-action="home">${t('Band karo', 'Exit')}</button></div>
      <div class="fast-track">
        <button class="button button-primary button-big" data-action="skip-party">${t('Seedha quiz shuru karo →', 'Start the quiz now →')}</button>
        <p>${t('Party choose karna optional hai.', 'Picking a party is optional.')}</p>
      </div>
      <p class="pick-or"><span>${t('ya mazaa double karo', 'or make it personal')}</span></p>
      <button class="party-card custom-card ${current === 'custom' ? 'selected' : ''}" data-action="custom-party">
        <span class="party-symbol" aria-hidden="true">${current === 'custom' ? escapeHtml(preference.custom.symbol) : '👑'}</span>
        <span class="party-short">${current === 'custom' ? escapeHtml(preference.custom.party) : t('Apni party banao', 'Create your own party')}</span>
        <span class="party-name">${t('Dost ko Supreme Leader banao: tum, dost, mummy, koi bhi 😄', 'Make anyone Supreme Leader: you, a friend, your mom 😄')}</span>
      </button>
      <div class="pick-head">
        <h1 id="pick-title">${t('Ya batao: aaj chunaav ho, toh vote kisko doge?', 'Or tell us: if the election were today, who gets your vote?')}</h1>
        <p class="pick-note"><span aria-hidden="true">🔒</span> ${privacyLine()}</p>
      </div>
      <div class="party-chips" role="list">
        ${parties.map((party) => `
          <button class="party-chip ${current === party.id ? 'selected' : ''}" role="listitem" data-party="${party.id}" aria-pressed="${current === party.id}" aria-label="${party.short}: ${party.name}" title="${party.name}">
            <span class="chip-symbol ${party.symbol ? '' : 'text-symbol'}" aria-hidden="true">${party.symbol || '🗳️'}</span>
            <span class="chip-name">${party.short}</span>
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
  app.querySelector('[data-action="skip-party"]').addEventListener('click', () => {
    preference = null;
    trackOnce('team_pick', 'team_pick', { path: 'skip' });
    beginQuestions();
  });
  app.querySelectorAll('[data-party]').forEach((button) => button.addEventListener('click', () => {
    const partyId = button.dataset.party;
    const party = findParty(partyId);
    trackOnce('team_pick', 'team_pick', { path: party ? 'listed' : 'skip' });
    preference = { partyId, leader: preference?.partyId === partyId ? preference.leader : null };
    if (party && party.leaders.length) renderLeader();
    else { preference.leader = null; beginQuestions(); }
  }));
  const title = app.querySelector('#pick-title'); title.setAttribute('tabindex', '-1');
}


function renderCustomParty() {
  setPage('custom');
  const draft = customDraft || (preference?.partyId === 'custom' ? preference.custom : { party: '', leader: '', symbol: customSymbols[0] });
  customDraft = null;
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
    trackOnce('team_pick', 'team_pick', { path: 'custom' });
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
  setPage('quiz', `quiz-${currentQuestion}`);
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
  // Same as the phone's Back button, so the in-page and browser history never disagree.
  app.querySelector('[data-action="back"]').addEventListener('click', () => {
    if (history.state?.screen === `quiz-${currentQuestion}` && history.length > 1) { history.back(); return; }
    currentQuestion -= 1; renderQuiz(); focusQuestion();
  });
  app.querySelector('[data-action="next"]')?.addEventListener('click', goForward);
  app.querySelector('[data-action="home"]').addEventListener('click', renderLanding);
  app.querySelector('[data-action="change-team"]')?.addEventListener('click', () => { resumeQuestion = currentQuestion; renderParty(); });
}

function focusQuestion() { app.querySelector('#question-title')?.setAttribute('tabindex', '-1'); app.querySelector('#question-title')?.focus({ preventScroll: true }); }

function chooseOption(index) {
  if (advancing) return;
  answers[currentQuestion] = index;
  trackOnce(`answered-${currentQuestion}`, 'quiz_progress', { question_number: currentQuestion + 1 });
  app.querySelectorAll('[data-option]').forEach((button) => {
    const isSelected = Number(button.dataset.option) === index;
    button.classList.toggle('selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
  advancing = true;
  const answeredQuestion = currentQuestion;
  // Short pause so the tap is visible. Skip it if Back/Forward moved away in the meantime.
  setTimeout(() => { if (!advancing) return; advancing = false; if (view === 'quiz' && currentQuestion === answeredQuestion) goForward(); }, 320);
}

function goForward() {
  if (answers[currentQuestion] === undefined) return;
  if (currentQuestion === questions.length - 1) { result = getResult(answers); trackOnce('complete', 'quiz_complete'); renderResult(); return; }
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
  if (total < MIN_TOTAL_FOR_CHART) {
    // Too few results for honest percentages: a small note instead of a chart. No numbers shown.
    box.innerHTML = `<p class="stats-warmup"><span aria-hidden="true">🎱</span> ${t('Public verdict abhi warm-up kar raha hai. Aur log quiz khelenge toh stats dikhenge.', 'The public verdict is still warming up. Stats appear once more people have played.')}</p>`;
    box.hidden = false;
    return;
  }
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
          <button class="button button-primary" data-action="start" data-cta="stats">${t('Main kahan hoon? 👀', 'Where do I fit? 👀')}</button>
          <p>${t('Ab tak ke saare khatam hue quiz (log nahi, quiz gine jaate hain). Survey nahi, bas mazaak.', 'All quizzes finished so far (quizzes are counted, not people). Not a survey, just fun.')}</p>
        </div>
      </div>`;
  }
  bindStartButtons(box);
  box.hidden = false;
}

async function showResultStat(archetype) {
  const line = app.querySelector('[data-result-stat]');
  let stats;
  try { stats = await recordResult(archetype.id); } catch { return; }
  if (!line?.isConnected || stats.total < MIN_TOTAL_FOR_CHART) return;
  const pct = percentages(stats.counts, stats.total)[archetype.id];
  line.textContent = t(`Ab tak ${pct}% quiz ka result ${shortTitle(archetype)} aaya. Tum akele nahi ho. 😌`, `${pct}% of quizzes so far ended in ${shortTitle(archetype)}. You are not alone. 😌`);
  line.hidden = false;
}

function renderResult() {
  setPage('result');
  const { counts, evidence } = result;
  const archetype = loc(result.archetype);
  const runnerUp = loc(result.runnerUp);
  const breakdown = rankHabits(counts, evidence).filter((habit) => counts[habit] > 0).map((habit) => `
    <li><span>${archetypes[habit].emoji} ${shortTitle(archetypes[habit])}</span><span class="habit-bar" aria-hidden="true"><i class="c-${habit}" style="width:${Math.round((counts[habit] / chances[habit]) * 100)}%"></i></span><span>${counts[habit]}/${chances[habit]}</span></li>`).join('');
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText('whatsapp'))}`;
  const kicker = cardKicker(preference, L());
  const canShareImage = canShareFiles();
  // Order = what matters most after the reveal: the card, one WhatsApp challenge, the image, the rest.
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
          <a class="button button-whatsapp button-big" href="${waLink}" target="_blank" rel="noopener" data-action="whatsapp">${t('WhatsApp pe challenge karo&nbsp;😏', 'Challenge on WhatsApp&nbsp;😏')}</a>
          <div class="result-actions-row">
            ${canShareImage
              ? `<button class="button button-plain" data-action="share-card">${t('Story pe lagao&nbsp;📲', 'Post to Story&nbsp;📲')}</button>`
              : `<button class="button button-plain" data-action="download-story">${t('Card download&nbsp;⬇️', 'Download card&nbsp;⬇️')}</button>`}
            <button class="button button-plain" data-action="share-link">${navigator.share ? t('Aur kahin bhejo 🔗', 'Share elsewhere 🔗') : t('Link copy karo 🔗', 'Copy link 🔗')}</button>
          </div>
          <a class="insta-link" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" data-action="instagram"><span aria-hidden="true">📸</span> ${t('Aise aur memes: @andhbhakt_ya_chamcha', 'More memes: @andhbhakt_ya_chamcha')}</a>
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
        <span class="result-downloads">${t('Card download:', 'Download card:')} <button class="text-button" data-action="download-story">${t('Story size', 'Story size')}</button> <button class="text-button" data-action="download-feed">${t('Post size', 'Post size')}</button></span>
      </div>
      <p class="result-note">${t('Sirf mazaak ke liye. Tumhare jawaab kahin save nahi hote.', 'Just for fun. Your answers are never saved.')}</p>
    </section>
  `;
  app.querySelector('h1').focus({ preventScroll: true });
  showResultStat(archetype);
  app.querySelector('[data-action="share-card"]')?.addEventListener('click', shareCard);
  app.querySelector('[data-action="share-link"]').addEventListener('click', shareLink);
  app.querySelectorAll('[data-action="download-story"]').forEach((button) => button.addEventListener('click', () => { track('share_click', { method: 'download_story' }); downloadCard('story'); }));
  app.querySelector('[data-action="download-feed"]').addEventListener('click', () => { track('share_click', { method: 'download_feed' }); downloadCard('feed'); });
  app.querySelector('[data-action="restart"]').addEventListener('click', restart);
  // A wa.me link gives no way to know if the message was actually sent, so this is only a tap.
  app.querySelector('[data-action="whatsapp"]').addEventListener('click', () => track('share_click', { method: 'whatsapp' }));
  app.querySelector('[data-action="instagram"]').addEventListener('click', () => track('instagram_click'));
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

// Share links carry campaign tags (fixed words only) so Google Analytics can tell where visitors came from.
const sharedUrl = (source, campaign) => campaignUrl(config.url, source, campaign);

function shareText(source) {
  const archetype = loc(result.archetype);
  const flavour = shareFlavour(preference, L());
  return `${flavour ? `${flavour}\n` : ''}${t('Mera result', 'My result')}: ${archetype.emoji} *${archetype.title}* 😭\n"${archetype.description}"\n\n${t('Tumhara kya aata hai? 7 sawaal, 2 minute', 'What do you get? 7 questions, 2 minutes')} 👉 ${sharedUrl(source, 'quiz_challenge')}`;
}

// Opens the phone's share sheet where available, otherwise copies the message. Only a resolved share
// or a successful copy counts as a confirmed share; cancelling counts as nothing.
async function shareLink() {
  if (navigator.share) {
    track('share_click', { method: 'share_sheet' });
    try {
      await navigator.share({ title: config.brand, text: shareText('share_sheet') });
      track('share', { method: 'share_sheet' });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  } else {
    track('share_click', { method: 'copy' });
  }
  const text = shareText('copy_link');
  try {
    await navigator.clipboard.writeText(text);
    track('share', { method: 'copy' });
    showToast(t('Message copy ho gaya. Dost ko paste karo.', 'Message copied. Paste it to a friend.'));
  } catch {
    showCopyBox(text);
  }
}

// Last resort when neither sharing nor the clipboard works (some in-app browsers): show the text to copy by hand.
function showCopyBox(text) {
  openSheet(`
    <h2>${t('Ye message copy karo', 'Copy this message')}</h2>
    <textarea class="sheet-text" readonly rows="6">${escapeHtml(text)}</textarea>
    <p class="sheet-help">${t('Text pe long-press karke "Copy" chuno, phir WhatsApp mein paste karo.', 'Long-press the text, choose "Copy", then paste it in WhatsApp.')}</p>`);
  const box = document.querySelector('.sheet-text');
  box?.focus(); box?.select();
}

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
  let kickerSize = L.kicker; const kickerText = kicker || t('Mera result:', 'My result:');
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
  ctx.fillText(t('Tumhara result kya hai? 2 minute ka quiz:', 'What is your result? A 2-minute quiz:'), cx, L.footer);
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
  drawCard(canvas, loc(result.archetype), format, displayUrl(), cardKicker(preference, L()));
  return canvas;
}
const cardName = (format) => `andhbhakt-ya-chamcha-${result.archetype.id}-${format}.png`;

// Phones that support sharing files (most Android and iOS browsers) can send the card image
// straight to WhatsApp Status, Instagram Stories etc. Others fall back to download.
function canShareFiles() {
  try { return Boolean(navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })); } catch { return false; }
}

// In-app browsers (Instagram, Facebook, some others) often ignore downloads silently.
const inAppBrowser = () => /Instagram|FBAN|FBAV|FB_IAB|Line\/|Snapchat/i.test(navigator.userAgent || '');
const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

async function shareCard() {
  track('share_click', { method: 'story_image' });
  const canvas = await renderCard('story');
  const blob = await toBlob(canvas);
  const file = new File([blob], cardName('story'), { type: 'image/png' });
  try {
    await navigator.share({ files: [file], text: shareText('share_sheet') });
    track('share', { method: 'story_image' }); // the browser reported the share went through
  } catch (error) {
    if (error.name !== 'AbortError') showCardImage(canvas, 'story');
  }
}

// Starts a download where the browser allows it. We can't know if the file was really saved,
// so the message only says the download started. In-app browsers get the image to long-press instead.
async function downloadCard(format) {
  const canvas = await renderCard(format);
  if (inAppBrowser()) { showCardImage(canvas, format); return; }
  const blob = await toBlob(canvas);
  if (!blob) { showCardImage(canvas, format); return; }
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = cardName(format);
  link.href = href;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 60000);
  showToast(t('Download shuru ho gaya ⬇️ Na mile toh dobara try karo.', 'Download started ⬇️ If it doesn’t show up, try again.'));
}

// Shows the card as a normal image the person can long-press to save (works in in-app browsers too).
function showCardImage(canvas, format) {
  const src = canvas.toDataURL('image/png');
  openSheet(`
    <h2>${t('Image taiyaar hai 📲', 'Image ready 📲')}</h2>
    <img class="sheet-image" src="${src}" alt="${t('Tumhara result card', 'Your result card')}">
    <p class="sheet-help">${t('Image pe long-press karke "Save image" chuno. Na ho paye toh ye page Chrome ya Safari mein kholo.', 'Long-press the image and choose "Save image". If that doesn’t work, open this page in Chrome or Safari.')}</p>
    <a class="button button-primary" href="${src}" download="${cardName(format)}">${t('Download try karo ⬇️', 'Try download ⬇️')}</a>`);
}

function openSheet(inner) {
  document.querySelector('.sheet-backdrop')?.remove();
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${t('Share', 'Share')}"><button class="sheet-close text-button" data-action="close-sheet">${t('Band karo ✕', 'Close ✕')}</button>${inner}</div>`;
  const close = () => { backdrop.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (event) => { if (event.key === 'Escape') close(); };
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop || event.target.closest('[data-action="close-sheet"]')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.append(backdrop);
  backdrop.querySelector('.sheet-close').focus({ preventScroll: true });
}

// A new quiz run. The party/leader pick is kept on replay (it only lives in memory), answers are not.
function startQuiz({ custom = false } = {}) {
  answers = []; currentQuestion = 0; result = null; resumeQuestion = null; advancing = false;
  quizActive = true; runEvents = new Set();
  if (custom) renderCustomParty(); else renderParty();
}
function beginQuestions() {
  if (resumeQuestion !== null) { currentQuestion = Math.min(resumeQuestion, answers.length); resumeQuestion = null; }
  trackOnce('quiz_start', 'quiz_start');
  renderQuiz();
  focusQuestion();
}
function restart() { startQuiz(); }

renderChrome();
replaceScreen('landing');
renderLanding();
