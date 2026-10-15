// When you change any file under src/, bump the ?v= value here, in scoring.js and in index.html
// (tests/scoring.test.js checks they all match) so returning visitors never mix old and new files.
import { englishQuestions, questions } from './questions.js?v=2026-10-16';
import { archetypes, chances, getResult, rankHabits } from './scoring.js?v=2026-10-16';
import { fillTokens, findParty, initials, neutralChoices, parties, personalWords } from './parties.js?v=2026-10-16';

// Public address used in share messages and on result cards.
const SITE_URL = 'https://andhbhaktyachamcha.in';

const config = {
  brand: 'Andhbhakt Ya Chamcha?',
  url: SITE_URL || window.location.origin,
};

const colours = {
  jamun: '#2a0a3b', chalk: '#fff7fb', haldi: '#ffc531', rani: '#cf0a6c',
  andhbhakt: '#ff7eb6', chamcha: '#ffc531', factChecker: '#3fd6b4', spectator: '#ff8a5c', manifesto: '#b9a3ff', independent: '#6fd3ff',
};

const app = document.querySelector('#app');
let answers = [];
let currentQuestion = 0;
let result = null;
let advancing = false;
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
const chosenParty = () => (preference?.partyId ? findParty(preference.partyId) : null);

function languageToggle() {
  return `<div class="language-toggle" role="group" aria-label="Question language"><span>Language</span><button class="${language === 'hinglish' ? 'active' : ''}" data-language="hinglish" aria-pressed="${language === 'hinglish'}">Hinglish</button><button class="${language === 'english' ? 'active' : ''}" data-language="english" aria-pressed="${language === 'english'}">English</button></div>`;
}

function bindLanguageToggle() {
  app.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => {
    language = button.dataset.language;
    ({ landing: renderLanding, party: renderParty, leader: renderLeader, quiz: renderQuiz })[view]?.();
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
            <p class="hero-lede">7 sawaal. Ek political reality check. Phir pata chalega group chat mein asli Bhakt, Chamcha aur Fact-Checker kaun hai. 👀</p>
            ${languageToggle()}
            <button class="button button-primary button-big" data-action="start">Chalo, Reality Check Lo 🔥</button>
            <p class="oath"><span aria-hidden="true">🤚</span> <em>"Jo kahunga sach kahunga, sach ke siwa kuch nahi kahunga."</em><small>Haath dil pe, phone haath mein. 📱😂</small></p>
            <p class="hero-note">2 minute. Koi signup nahi. Tumhare jawaab kahin save nahi hote.</p>
          </div>
          <div class="ticket-stack" aria-hidden="true">
            ${fan.map((a) => `<div class="ticket c-${a.id}"><div class="ticket-emoji">${a.emoji}</div><h3>${shortTitle(a)}</h3><p>${a.subtitle}</p></div>`).join('')}
            <div class="stamp">Tumhara<br>result?</div>
          </div>
        </div>
      </section>

      <section class="steps page-width" aria-labelledby="steps-title">
        <h2 id="steps-title">Kaise kaam karta hai</h2>
        <ol>
          <li><strong>7 sawaal ka jawaab do</strong><p>Political situations jo har group chat mein hoti hain. Sach sach chuno.</p></li>
          <li><strong>Apni habit dekho</strong><p>Tumhare answers ka pattern decide karega tumhara result. Phir milega tumhara political personality roast. 😂</p></li>
          <li><strong>Dost ko challenge karo</strong><p>Apna result share karo, dost ko challenge karo. Dekhte hain kaun apna result accept karta hai aur kaun appeal file karta hai. 😂</p></li>
        </ol>
      </section>

      <section class="results-intro page-width" aria-labelledby="results-title">
        <h2 id="results-title">6 Categories. Ek Tum. Kaunsi Wali? 👀</h2>
        <p>Har result ek political aadat hai. Kisi bhi party ka fan inme se koi bhi ho sakta hai.</p>
        <div class="result-tiles">
          ${Object.values(archetypes).map((a) => `<article class="result-tile c-${a.id}"><div class="tile-emoji" aria-hidden="true">${a.emoji}</div><div><h3>${shortTitle(a)}</h3><p>${a.subtitle}</p></div></article>`).join('')}
        </div>
        <div class="habit-note">
          <div class="note-emoji" aria-hidden="true">🤝</div>
          <div><strong>Andhbhakt aur Chamcha yahan party nahi, aadatein hain.</strong><p>Andhbhakt matlab "mera leader galat ho hi nahi sakta." Chamcha matlab "meri side galat ho hi nahi sakti." Ye dono kisi bhi side ke supporter mein mil sakti hain. Ye quiz kisi party ko judge nahi karta.</p></div>
        </div>
      </section>

      <section class="landing-cta page-width">
        <h2>Ab apni baari. Dekhte hain tumhara dimaag kis side hai. 👀</h2>
        <button class="button button-primary button-big" data-action="start">Mera Result Batao 🔥</button>
      </section>
    </div>
  `;
  bindLanguageToggle();
  app.querySelectorAll('[data-action="start"]').forEach((button) => button.addEventListener('click', startQuiz));
}


const privacyLine = () => t(
  'Ye score mein count nahi hota. Bas sawaal tumhari situation ke hisaab se dikhenge. Tumhara jawaab kahin save ya send nahi hota.',
  'This is not scored. It only makes the questions match your situation. Your choice is never saved or sent anywhere.'
);

function renderParty() {
  setPage('party');
  const current = preference?.partyId;
  app.innerHTML = `
    <section class="pick-shell page-width" aria-labelledby="pick-title">
      <div class="quiz-top"><span>${t('Shuru karne se pehle', 'Before we start')}</span><button class="text-button" data-action="home">${t('Band karo', 'Exit')}</button></div>
      ${languageToggle()}
      <div class="pick-head">
        <div class="pick-emoji" aria-hidden="true">🗳️</div>
        <h1 id="pick-title">${t('Aaj chunaav ho, toh vote kisko doge?', 'If the election were today, who gets your vote?')}</h1>
        <p class="pick-note"><span aria-hidden="true">🔒</span> ${privacyLine()}</p>
      </div>
      <div class="party-grid" role="list">
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
      <p class="pick-small">${t('Party symbols yahan sirf emoji hain, official logo nahi. Ye site kisi party se judi nahi hai.', 'Party symbols here are just emoji, not official logos. This site is not linked to any party.')}</p>
    </section>
  `;
  bindLanguageToggle();
  app.querySelector('[data-action="home"]').addEventListener('click', renderLanding);
  app.querySelectorAll('[data-party]').forEach((button) => button.addEventListener('click', () => {
    const partyId = button.dataset.party;
    const party = findParty(partyId);
    preference = { partyId, leader: preference?.partyId === partyId ? preference.leader : null };
    if (party && party.leaders.length) renderLeader();
    else { preference.leader = null; beginQuestions(); }
  }));
  const title = app.querySelector('#pick-title'); title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true });
}

function renderLeader() {
  const party = chosenParty();
  if (!party) { beginQuestions(); return; }
  setPage('leader');
  app.innerHTML = `
    <section class="pick-shell page-width" aria-labelledby="pick-title">
      <div class="quiz-top"><button class="text-button" data-action="back-party">${t('Party badlo', 'Change party')}</button><button class="text-button" data-action="home">${t('Band karo', 'Exit')}</button></div>
      ${languageToggle()}
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
  const label = party ? `${party.symbol ? `${party.symbol} ` : ''}${party.short}${preference.leader ? ` · ${preference.leader}` : ''}` : t('🗳️ Tumhari party', '🗳️ Your party');
  return `<div class="team-chip"><span>${t('Tumhari team:', 'Your team:')} <strong>${label}</strong></span><button class="text-button" data-action="change-team">${t('Badlo', 'Change')}</button></div>`;
}

function sceneMarkup(question) {
  const party = chosenParty();
  let sticker = '';
  if (question.about === 'leader' && party && preference.leader) {
    sticker = `<div class="scene-sticker leader-sticker"><span class="leader-avatar small">${initials(preference.leader)}</span><span>${preference.leader}</span></div>`;
  } else if (question.about && party) {
    sticker = `<div class="scene-sticker party-sticker"><span class="party-symbol small ${party.symbol ? '' : 'text-symbol'}">${party.symbol || party.short.slice(0, 3)}</span><span>${party.short}</span></div>`;
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
  const words = personalWords(preference, L());
  const question = { ...raw, prompt: fillTokens(raw.prompt, words), options: raw.options.map((option) => ({ ...option, text: fillTokens(option.text, words) })) };
  const selected = answers[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;
  app.innerHTML = `
    <section class="quiz-shell page-width" aria-labelledby="question-title">
      <div class="quiz-top"><span>${language === 'english' ? 'Question' : 'Sawaal'} ${currentQuestion + 1} / ${activeQuestions().length}</span><button class="text-button" data-action="home">${language === 'english' ? 'Exit' : 'Band karo'}</button></div>
      ${languageToggle()}
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
            : `<span class="quiz-hint">${language === 'english' ? 'Choose an answer to continue' : 'Jawaab chunte hi agla sawaal aayega'}</span>`}
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
  if (currentQuestion === questions.length - 1) { result = getResult(answers); renderResult(); return; }
  currentQuestion += 1;
  renderQuiz();
  focusQuestion();
}

function renderResult() {
  setPage('result');
  const { archetype, runnerUp, counts, evidence } = result;
  const breakdown = rankHabits(counts, evidence).filter((habit) => counts[habit] > 0).map((habit) => `
    <li><span>${archetypes[habit].emoji} ${shortTitle(archetypes[habit])}</span><span class="habit-bar" aria-hidden="true"><i class="c-${habit}" style="width:${Math.round((counts[habit] / chances[habit]) * 100)}%"></i></span><span>${counts[habit]} / ${chances[habit]} mauke</span></li>`).join('');
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText())}`;
  app.innerHTML = `
    <section class="result-band c-${archetype.id}">
      <div class="result-hero page-width">
        <p class="result-kicker">Tumhara verdict aa gaya</p>
        <div class="result-emoji" aria-hidden="true">${archetype.emoji}</div>
        <h1 tabindex="-1">${archetype.title}</h1>
        <p class="result-subtitle">${archetype.subtitle}</p>
        ${runnerUp ? `<p class="runner-up">Thoda sa ${runnerUp.emoji} ${shortTitle(runnerUp)} bhi.</p>` : ''}
        <div class="stamp" aria-hidden="true">Unofficial<br>verdict</div>
      </div>
    </section>
    <section class="result-body page-width">
      <div class="roast">
        <blockquote>“${archetype.description}”</blockquote>
        <p>${archetype.verdict}</p>
      </div>
      <div class="traits">
        <article class="trait-good"><h2>Superpower</h2><p>${archetype.superpower}</p></article>
        <article class="trait-blind"><h2>Blind spot</h2><p>${archetype.weakness}</p></article>
      </div>

      <div class="share-box">
        <h2>Ab group mein bhejo</h2>
        <p>Result card Status pe lagao, aur dekho kaun appeal file karta hai. 😂</p>
        <div class="share-row">
          ${canShareFiles() ? '<button class="button button-whatsapp" data-action="share-card">Status pe lagao</button>' : ''}
          <a class="button ${canShareFiles() ? 'button-plain' : 'button-whatsapp'}" href="${waLink}" target="_blank" rel="noopener">WhatsApp pe bhejo</a>
          <button class="button button-primary" data-action="challenge">Dost ko challenge karo</button>
          ${canShareFiles() ? '' : `<button class="button button-plain" data-action="share">${navigator.share ? 'Kahin aur share karo' : 'Result copy karo'}</button>`}
        </div>
        <div class="card-row">
          <span>Result card download karo:</span>
          <button class="text-button" data-action="download-story">Status / Story size</button>
          <button class="text-button" data-action="download-feed">Instagram post size</button>
        </div>
      </div>

      <div class="habit-breakdown">
        <h2>Tumhare ${questions.length} jawaab</h2>
        <p>Har habit ko kuch mauke mile. Tumne kitni baar kaunsi chuni, ye raha poora hisaab.</p>
        <ul>${breakdown}</ul>
      </div>

      <div class="result-footer-actions">
        <button class="text-button" data-action="restart">Quiz dobara do</button>
        <button class="text-button" data-action="method" aria-expanded="false">Result kaise decide hota hai?</button>
      </div>
      <div class="method-note" hidden><strong>Transparent hai, scientific nahi.</strong> Har jawaab ek habit dikhata hai. Har habit quiz mein 4 ya 5 baar option ke roop mein aati hai, isliye hum dekhte hain ki tumne har habit ke kitne mauke liye. Jo habit tumne sabse zyada (share mein) chuni, wahi result. Barabar hone par, jis habit ka sabse clear "signature" jawab tumne chuna, wo jeet-ti hai. Koi party, leader ya personal data involved nahi.</div>
      <p class="result-note">Ye result entertainment ke liye hai. Ye tumhari political affiliation ke baare mein koi claim nahi karta.</p>
    </section>
  `;
  app.querySelector('h1').focus({ preventScroll: true });
  app.querySelector('[data-action="share"]')?.addEventListener('click', shareResult);
  app.querySelector('[data-action="share-card"]')?.addEventListener('click', shareCard);
  app.querySelector('[data-action="challenge"]').addEventListener('click', shareChallenge);
  app.querySelector('[data-action="download-story"]').addEventListener('click', () => downloadCard('story'));
  app.querySelector('[data-action="download-feed"]').addEventListener('click', () => downloadCard('feed'));
  app.querySelector('[data-action="restart"]').addEventListener('click', restart);
  app.querySelector('[data-action="method"]').addEventListener('click', (event) => {
    const note = app.querySelector('.method-note');
    note.hidden = !note.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!note.hidden));
  });
}

function shareText() {
  const { archetype } = result;
  return `Mera result: ${archetype.emoji} *${archetype.title}*\n"${archetype.description}" 😂\n\nTu kya niklega? Andhbhakt, Chamcha ya kuch aur?\n${questions.length} sawaal, 2 minute: ${config.url}`;
}
function challengeText() { return `Bhai, ek political reality check de. Main toh ${result.archetype.emoji} ${shortTitle(result.archetype)} nikla. Tu kya niklega? 😏\nResult screenshot karke bhejna, cheating nahi.\n${config.url}`; }

async function shareOrCopy(text, copiedMessage) {
  if (navigator.share) {
    try { await navigator.share({ title: config.brand, text }); return; } catch (error) { if (error.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(text); showToast(copiedMessage); } catch { showToast('Copy nahi ho paya. Link: ' + displayUrl()); }
}
const shareResult = () => shareOrCopy(shareText(), 'Result copy ho gaya. Ab group mein paste karo.');
const shareChallenge = () => shareOrCopy(challengeText(), 'Challenge copy ho gaya. Dost ko bhejo.');

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

export function drawCard(canvas, archetype, format, url) {
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
  ctx.fillText('Mera political verdict:', cx, y);

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
  ctx.fillText('Tu kya niklega? 2 minute ka quiz:', cx, L.footer);
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
  drawCard(canvas, result.archetype, format, displayUrl());
  return canvas;
}
const cardName = (format) => `andhbhakt-ya-chamcha-${result.archetype.id}-${format}.png`;

// Phones that support sharing files (most Android and iOS browsers) can send the card image
// straight to WhatsApp Status, Instagram Stories etc. Others fall back to download.
function canShareFiles() {
  try { return Boolean(navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })); } catch { return false; }
}

async function shareCard() {
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
  showToast('Card download ho gaya. Ab Status pe lagao.');
}

function startQuiz() { answers = []; currentQuestion = 0; result = null; resumeQuestion = null; renderParty(); }
function beginQuestions() {
  if (resumeQuestion !== null) { currentQuestion = resumeQuestion; resumeQuestion = null; }
  renderQuiz();
  focusQuestion();
}
function restart() { startQuiz(); }

renderLanding();
