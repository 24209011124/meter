import { questions } from './questions.js';
import { archetypes, getResult, rankHabits } from './scoring.js';

const config = {
  brand: 'Bhakt Ya Chamcha?',
  canonicalUrl: window.location.origin,
};

const app = document.querySelector('#app');
let answers = [];
let currentQuestion = 0;
let result = null;

const optionLetter = (index) => String.fromCharCode(65 + index);

function renderLanding() {
  app.innerHTML = `
    <section class="hero page-width">
      <div class="hero-copy reveal">
        <p class="eyebrow">Political thinking ka unofficial audit</p>
        <h1>Bhakt ho ya<br><em>Chamcha?</em></h1>
        <p class="hero-lede">10 sawaal. Zero political gyaan ki zaroorat. Bas apni political thinking ka reality check lo.</p>
        <button class="button button-primary" data-action="start">Chalo, Test Karte Hain <span aria-hidden="true">→</span></button>
        <p class="microcopy">Approx. 2 minutes · No signup · No answers stored</p>
      </div>
      <div class="hero-art reveal reveal-delay" aria-label="A playful illustration of a thinking meter">
        <div class="meter-card">
          <span class="meter-label">YOUR POLITICAL<br>VIBE METER</span>
          <span class="meter-emoji">🧠</span>
          <div class="meter-line"><i></i><i></i><i></i><i></i><i></i></div>
          <span class="meter-caption">Results may expose<br>your group chat behaviour.</span>
        </div>
        <span class="scribble scribble-top">no pressure 👀</span>
        <span class="scribble scribble-bottom">source?</span>
      </div>
    </section>
    <section class="intro-strip page-width">
      <div><span class="strip-number">01</span><h2>Ten questions.<br>One honest-ish result.</h2></div>
      <p>Leader loyalty, source checking, accountability aur double standards. Yahan "Bhakt" aur "Chamcha" kisi party ke supporters nahi, do aadatein hain: leader ko kabhi galat na maanna, aur apni side ko hamesha bachana. Ye dono kisi bhi side ke fan mein mil sakti hain.</p>
    </section>
    <section class="result-preview page-width">
      <div class="section-heading"><p class="eyebrow">Six possible results</p><h2>Tumhari category kaunsi hai?</h2></div>
      <div class="preview-grid">
        ${Object.values(archetypes).map((a) => `<span>${a.emoji} ${a.title.replace(': ON', '')}</span>`).join('')}
      </div>
    </section>
    <section class="disclaimer page-width"><strong>Small disclaimer, big honesty:</strong> This is entertainment and reflection, not a scientific assessment of political beliefs or an endorsement of any political party.</section>
  `;
  app.querySelector('[data-action="start"]').addEventListener('click', startQuiz);
}

function renderQuiz() {
  const question = questions[currentQuestion];
  const selected = answers[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  app.innerHTML = `
    <section class="quiz-shell page-width">
      <div class="quiz-topline"><span>Question ${currentQuestion + 1} of ${questions.length}</span><span>${Math.round(progress)}%</span></div>
      <div class="progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="10" aria-valuenow="${currentQuestion + 1}" aria-label="Quiz progress"><span style="width:${progress}%"></span></div>
      <div class="question-card reveal">
        <p class="eyebrow">Q${String(currentQuestion + 1).padStart(2, '0')} · Sach sach bolna</p>
        <h1>${question.prompt}</h1>
        <fieldset class="options" aria-label="Answer choices">
          <legend class="sr-only">Choose one answer</legend>
          ${question.options.map((option, index) => `<button class="option ${selected === index ? 'selected' : ''}" data-option="${index}" aria-pressed="${selected === index}"><span class="option-letter">${optionLetter(index)}</span><span>${option.text}</span></button>`).join('')}
        </fieldset>
        <div class="quiz-actions">
          <button class="button button-quiet" data-action="back" ${currentQuestion === 0 ? 'disabled' : ''}>← Back</button>
          <button class="button button-primary" data-action="next" ${selected === undefined ? 'disabled' : ''}>${currentQuestion === questions.length - 1 ? 'Reveal My Result' : 'Next Question'} <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </section>
  `;
  app.querySelectorAll('[data-option]').forEach((button) => button.addEventListener('click', () => {
    answers[currentQuestion] = Number(button.dataset.option);
    renderQuiz();
    app.querySelector(`[data-option="${answers[currentQuestion]}"]`).focus();
  }));
  app.querySelector('[data-action="back"]').addEventListener('click', () => { currentQuestion -= 1; renderQuiz(); });
  app.querySelector('[data-action="next"]').addEventListener('click', () => {
    if (currentQuestion === questions.length - 1) { result = getResult(answers); renderResult(); }
    else { currentQuestion += 1; renderQuiz(); }
  });
}

function renderResult() {
  const { archetype, runnerUp, counts, last } = result;
  const breakdown = rankHabits(counts, last).filter((habit) => counts[habit] > 0).map((habit) => `
        <li><span>${archetypes[habit].emoji} ${archetypes[habit].title.replace(': ON', '')}</span><span class="habit-bar" aria-hidden="true"><i style="width:${counts[habit] * 10}%"></i></span><b>${counts[habit]}/10</b></li>`).join('');
  app.innerHTML = `
    <section class="result-shell page-width">
      <div class="result-header reveal"><p class="eyebrow">Your unofficial verdict</p><div class="result-emoji" aria-hidden="true">${archetype.emoji}</div><h1>${archetype.title}</h1><p class="result-subtitle">${archetype.subtitle}</p>${runnerUp ? `<p class="runner-up">Thoda sa ${runnerUp.emoji} ${runnerUp.title.replace(': ON', '')} bhi.</p>` : ''}</div>
      <div class="result-grid">
        <article class="verdict-panel reveal"><p class="big-quote">“${archetype.description}”</p><div class="verdict-line">${archetype.verdict}</div></article>
        <div class="trait-stack reveal reveal-delay"><article><span>SUPERPOWER</span><p>${archetype.superpower}</p></article><article><span>BLIND SPOT</span><p>${archetype.weakness}</p></article></div>
      </div>
      <div class="habit-breakdown reveal"><p class="eyebrow">Tumhare 10 jawaab, habit ke hisaab se</p><ul>${breakdown}
      </ul></div>
      <div class="result-actions"><button class="button button-primary" data-action="share">Share My Result <span aria-hidden="true">↗</span></button><button class="button button-secondary" data-action="download-story">Download Story Card</button><button class="button button-secondary" data-action="download-feed">Download Feed Card</button><button class="button button-quiet" data-action="challenge">Challenge a Friend</button></div>
      <p class="result-note">Your answers stay in this browser. The result is for entertainment, not a diagnosis or a claim about your political affiliation.</p>
      <div class="result-footer-actions"><button class="text-button" data-action="restart">Take the quiz again</button><button class="text-button" data-action="method">How is this decided?</button></div>
      <div class="method-note" hidden><strong>Transparent, not scientific.</strong> Har jawaab ek habit se juda hai. Jo habit tumne sabse zyada choose ki, wahi tumhara result hai, aur doosri sabse common habit bhi dikhayi jaati hai. Tie hone par jo habit tumne sabse last mein choose ki, wo jeet-ti hai. Koi party, leader ya personal data involved nahi.</div>
    </section>
  `;
  app.querySelector('[data-action="share"]').addEventListener('click', shareResult);
  app.querySelector('[data-action="download-story"]').addEventListener('click', () => downloadCard('story'));
  app.querySelector('[data-action="download-feed"]').addEventListener('click', () => downloadCard('feed'));
  app.querySelector('[data-action="challenge"]').addEventListener('click', shareChallenge);
  app.querySelector('[data-action="restart"]').addEventListener('click', restart);
  app.querySelector('[data-action="method"]').addEventListener('click', () => { const note = app.querySelector('.method-note'); note.hidden = !note.hidden; });
}

function shareText() { return `Mera result: ${result.archetype.emoji} ${result.archetype.title}\n\n${result.archetype.subtitle}\n\nBhakt Ya Chamcha? Apna political thinking reality check lo: ${config.canonicalUrl}`; }
function shareChallengeText() { return `Bhai, maine test de diya. Ab teri baari. Dekhte hain tu Bhakt hai, Chamcha hai ya apni alag hi category! 😂\n${config.canonicalUrl}`; }

async function shareResult() {
  const data = { title: config.brand, text: shareText(), url: config.canonicalUrl };
  if (navigator.share) { try { await navigator.share(data); return; } catch (error) { if (error.name === 'AbortError') return; } }
  await copyText(`${data.text}`);
  showToast('Result copy ho gaya. Ab group chat mein daalo.');
}
async function shareChallenge() {
  const text = shareChallengeText();
  if (navigator.share) { try { await navigator.share({ title: config.brand, text, url: config.canonicalUrl }); return; } catch (error) { if (error.name === 'AbortError') return; } }
  await copyText(text);
  showToast('Challenge copy ho gaya. Friend ko bhejo.');
}
async function copyText(text) { await navigator.clipboard?.writeText(text); }
function showToast(message) { const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = message; document.body.append(toast); setTimeout(() => toast.remove(), 2800); }

function downloadCard(format) {
  const canvas = document.createElement('canvas');
  canvas.width = format === 'story' ? 1080 : 1080;
  canvas.height = format === 'story' ? 1920 : 1350;
  const context = canvas.getContext('2d');
  context.fillStyle = '#17130f'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#efc84a'; context.fillRect(70, 110, 145, 14);
  context.fillStyle = '#f5eee1'; context.font = '700 42px sans-serif'; context.fillText('BHAKT YA CHAMCHA?', 70, 190);
  context.font = '120px sans-serif'; context.fillText(result.archetype.emoji, 70, 430);
  context.fillStyle = '#efc84a'; context.font = '700 76px sans-serif'; wrapText(context, result.archetype.title, 70, 570, 900, 92);
  context.fillStyle = '#f5eee1'; context.font = '500 36px sans-serif'; wrapText(context, result.archetype.subtitle, 70, 790, 900, 48);
  context.fillStyle = '#d8cfc2'; context.font = '400 40px sans-serif'; wrapText(context, `“${result.archetype.description}”`, 70, 930, 900, 58);
  context.fillStyle = '#efc84a'; context.font = '700 30px sans-serif'; context.fillText('YOUR UNOFFICIAL VERDICT', 70, canvas.height - 220);
  context.fillStyle = '#f5eee1'; context.font = '500 32px sans-serif'; context.fillText(config.canonicalUrl.replace(/^https?:\/\//, ''), 70, canvas.height - 155);
  const link = document.createElement('a'); link.download = `bhakt-ya-chamcha-${result.archetype.id}-${format}.png`; link.href = canvas.toDataURL('image/png'); link.click();
}
function wrapText(context, text, x, y, maxWidth, lineHeight) { let line = ''; text.split(' ').forEach((word) => { const test = `${line}${word} `; if (context.measureText(test).width > maxWidth && line) { context.fillText(line, x, y); y += lineHeight; line = `${word} `; } else line = test; }); if (line) context.fillText(line, x, y); }
function startQuiz() { answers = []; currentQuestion = 0; renderQuiz(); app.focus(); }
function restart() { result = null; startQuiz(); }

renderLanding();
