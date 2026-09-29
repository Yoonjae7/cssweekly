const stage = document.getElementById('stage');
const slides = [...document.querySelectorAll('.slide')];
const fullscreen = document.getElementById('fullscreen');

let current = 0;

function fitStage() {
  const availableHeight = window.innerHeight;
  const scale = Math.min(window.innerWidth / 1440, availableHeight / 810);
  stage.style.setProperty('--scale', String(Math.max(0.1, scale)));
}

function showSlide(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, position) => {
    const active = position === current;
    slide.hidden = !active;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  document.title = `CSS Weekly #01 — Slide ${current + 1} of ${slides.length}`;
  history.replaceState(null, '', `#slide-${current + 1}`);
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    // Some embedded browsers do not expose the Fullscreen API.
  }
}

fullscreen.addEventListener('click', toggleFullscreen);

document.addEventListener('keydown', event => {
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    showSlide(current + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    showSlide(current - 1);
  } else if (event.key === 'Home') showSlide(0);
  else if (event.key === 'End') showSlide(slides.length - 1);
  else if (event.key.toLowerCase() === 'f') void toggleFullscreen();
  else if (event.key.toLowerCase() === 'p') window.print();
});

window.addEventListener('resize', fitStage);
window.addEventListener('hashchange', () => {
  const match = location.hash.match(/^#slide-(\d+)$/);
  if (match) showSlide(Number(match[1]) - 1);
});

fitStage();
const initial = location.hash.match(/^#slide-(\d+)$/);
showSlide(initial ? Number(initial[1]) - 1 : 0);
