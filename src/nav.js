// Browser Back / Forward for the one-page quiz.
//
// Each step (home, party screen, question 3, result...) gets a history entry so the phone's Back button
// goes to the previous step instead of leaving the site. An entry holds ONLY a screen name such as
// "quiz-3". Never answers, party, leader or names. The page address never changes, so refresh and
// GitHub Pages routing work as before.

export const SCREEN_PATTERN = /^(landing|party|leader|custom|quiz-[0-6]|result)$/;

const current = () => history.state?.screen;

// New step: add an entry, unless we are already on it (re-renders and language switches add nothing).
export function pushScreen(screen) {
  if (!SCREEN_PATTERN.test(screen) || current() === screen) return;
  history.pushState({ screen }, '');
}

export function replaceScreen(screen) {
  if (!SCREEN_PATTERN.test(screen)) return;
  history.replaceState({ screen }, '');
}

export function onScreenChange(handler) {
  window.addEventListener('popstate', (event) => {
    const screen = event.state?.screen;
    handler(SCREEN_PATTERN.test(screen || '') ? screen : 'landing');
  });
}
