import { englishQuestions, questions } from './questions.js';
import { archetypes, getResult, rankHabits } from './scoring.js';

// Set SITE_URL to the production address (e.g. 'https://bhaktyachamcha.in') before launch.
// Until then the current page origin is used.
const SITE_URL = 'https://24209011124.github.io/meter';

const config = {
  brand: 'Andhbhakt Ya Chamcha?',
  shortBrand: 'AB ya C',
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

const optionLetter = (index) => String.fromCharCode(65 + index);
const shortTitle = (archetype) => archetype.title.replace(': ON', '');
const displayUrl = () => config.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
const activeQuestions = () => language === 'english' ? englishQuestions : questions;

function languageToggle() {
  return `<div class="language-toggle" role="group" aria-label="Question language"><span>Language</span><button class="${language === 'hinglish' ? 'active' : ''}" data-language="hinglish" aria-pressed="${language === 'hinglish'}">Hinglish</button><button class="${language === 'english' ? 'active' : ''}" data-language="english" aria-pressed="${language === 'english'}">English</button></div>`;
}

function bindLanguageToggle() {
  app.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => {
    language = button.dataset.language;
    if (document.body.classList.contains('is-landing')) renderLanding();
    else renderQuiz();
  }));
}

function setPage(name) {
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
            <p class="hero-note">2 min Quiz. Signup nahi.</p>
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

function renderQuiz() {
  setPage('quiz');
  const question = activeQuestions()[currentQuestion];
  const selected = answers[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;
  app.innerHTML = `
    <section class="quiz-shell page-width" aria-labelledby="question-title">
      <div class="quiz-top"><span>${language === 'english' ? 'Question' : 'Sawaal'} ${currentQuestion + 1} / ${activeQuestions().length}</span><button class="text-button" data-action="home">${language === 'english' ? 'Exit' : 'Band karo'}</button></div>
      ${languageToggle()}
      <div class="progress-dots" role="progressbar" aria-valuemin="1" aria-valuemax="${activeQuestions().length}" aria-valuenow="${currentQuestion + 1}" aria-label="Quiz progress">
        ${activeQuestions().map((_, index) => `<i class="${index < currentQuestion ? 'done' : index === currentQuestion ? 'current' : ''}"></i>`).join('')}
      </div>
      <div class="question-card">
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
  const { archetype, runnerUp, counts, last } = result;
  const breakdown = rankHabits(counts, last).filter((habit) => counts[habit] > 0).map((habit) => `
    <li><span>${archetypes[habit].emoji} ${shortTitle(archetypes[habit])}</span><span class="habit-bar" aria-hidden="true"><i class="c-${habit}" style="width:${counts[habit] * (100 / questions.length)}%"></i></span><span>${counts[habit]} / ${questions.length}</span></li>`).join('');
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
        <p>Dekhte hain tumhare dost kya nikalte hain.</p>
        <div class="share-row">
          <a class="button button-whatsapp" href="${waLink}" target="_blank" rel="noopener">WhatsApp pe bhejo</a>
          <button class="button button-primary" data-action="challenge">Dost ko challenge karo</button>
          <button class="button button-plain" data-action="share">${navigator.share ? 'Kahin aur share karo' : 'Result copy karo'}</button>
        </div>
        <div class="card-row">
          <span>Result card download karo:</span>
          <button class="text-button" data-action="download-story">Status / Story size</button>
          <button class="text-button" data-action="download-feed">Instagram post size</button>
        </div>
      </div>

      <div class="habit-breakdown">
        <h2>Tumhare 7 jawaab</h2>
        <p>Har jawaab ek habit se juda tha. Ye raha poora hisaab.</p>
        <ul>${breakdown}</ul>
      </div>

      <div class="result-footer-actions">
        <button class="text-button" data-action="restart">Quiz dobara do</button>
        <button class="text-button" data-action="method" aria-expanded="false">Result kaise decide hota hai?</button>
      </div>
      <div class="method-note" hidden><strong>Transparent hai, scientific nahi.</strong> Har answer ek reasoning habit se map hota hai. Tumhare 7 answers ka overall pattern primary result aur runner-up decide karta hai. Tie hone par tumhara sabse recent matching answer tie-break karta hai. Koi party, leader ya personal data involved nahi.</div>
      <p class="result-note">Ye result entertainment ke liye hai. Ye tumhari political affiliation ke baare mein koi claim nahi karta.</p>
    </section>
  `;
  app.querySelector('h1').focus({ preventScroll: true });
  app.querySelector('[data-action="share"]').addEventListener('click', shareResult);
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
  return `Mera result: ${archetype.emoji} ${archetype.title}\n"${archetype.description}"\n\nTu kya niklega? Andhbhakt, Chamcha ya kuch aur? 2 minute ka quiz:\n${config.url}`;
}
function challengeText() { return `Maine Andhbhakt Ya Chamcha? quiz de diya. Ab teri baari 😏\nResult screenshot karke bhejna, cheating nahi.\n${config.url}`; }

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
  ctx.fillText(config.shortBrand, pad, L.top - (story ? 40 : 30));
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

async function downloadCard(format) {
  try { await Promise.all([document.fonts.load('60px "Yatra One"'), document.fonts.load('600 40px Hind'), document.fonts.load('700 40px Hind')]); } catch { /* fall back to system fonts */ }
  const canvas = document.createElement('canvas');
  drawCard(canvas, result.archetype, format, displayUrl());
  const link = document.createElement('a');
  link.download = `andhbhakt-ya-chamcha-${result.archetype.id}-${format}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('Card download ho gaya. Ab Status pe lagao.');
}

function startQuiz() { answers = []; currentQuestion = 0; result = null; renderQuiz(); focusQuestion(); }
function restart() { startQuiz(); }

renderLanding();
