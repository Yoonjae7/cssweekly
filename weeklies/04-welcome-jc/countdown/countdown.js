// CSS Weekly Week 4 countdown. Duration defaults to 10 minutes; override with ?min=5 in the URL.

const $ = id => document.getElementById(id);
const stage = $('stage');
const screen = $('screen');

const params = new URLSearchParams(location.search);
const defaultMinutes = Math.min(99, Math.max(1, Number(params.get('min')) || 10));

/* ---------- Stage scaling (same 1440x810 stage as the CSS Weekly deck) ---------- */

function fitStage() {
  const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
  stage.style.setProperty('--scale', String(Math.max(0.1, scale)));
}
window.addEventListener('resize', fitStage);
fitStage();

/* ---------- Pixel digits ---------- */

const GLYPHS = {
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
};

function buildDigit(el) {
  el.innerHTML = '<i></i>'.repeat(35);
}

function setDigit(el, n) {
  const rows = GLYPHS[n];
  [...el.children].forEach((cell, i) => {
    cell.classList.toggle('on', rows[Math.floor(i / 5)][i % 5] === '1');
  });
}

const clockDigits = [...document.querySelectorAll('#clock .pixel-digit')];
const finalDigits = [...document.querySelectorAll('#finalDigits .pixel-digit')];
[...clockDigits, ...finalDigits].forEach(buildDigit);

/* ---------- Loader bar, floating pixels ---------- */

const loader = $('loader');
const SEGMENTS = 24;
loader.innerHTML = '<i></i>'.repeat(SEGMENTS);
const segments = [...loader.children];

const palette = ['var(--mint)', 'var(--pink)', 'var(--purple)', 'var(--lavender)'];
const rand = (min, max) => min + Math.random() * (max - min);
const pick = list => list[Math.floor(Math.random() * list.length)];

$('floaters').innerHTML = Array.from({ length: 26 }, () => {
  const style = [
    `left:${rand(0, 100)}%`,
    `--s:${Math.round(rand(4, 12))}px`,
    `--c:${pick(palette)}`,
    `--d:${rand(14, 30).toFixed(1)}s`,
    `--delay:${(-rand(0, 30)).toFixed(1)}s`,
    `--x:${Math.round(rand(-80, 80))}px`,
  ].join(';');
  return `<i style="${style}"></i>`;
}).join('');

/* ---------- Binary footer: spells a word, with the odd bit flickering ---------- */

let binaryWord = '';
function setBinary(word) {
  binaryWord = word;
  renderBinary();
}
function renderBinary(flip = -1) {
  const bits = [...binaryWord].map(ch => ch.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  $('binary').innerHTML = [...bits].map((b, i) => (i === flip ? `<b>${b === '1' ? '0' : '1'}</b>` : b)).join('');
}
setInterval(() => {
  const len = binaryWord.length * 9 - 1;
  let i = Math.floor(Math.random() * len);
  if (i % 9 === 8) i--;
  renderBinary(i);
  setTimeout(() => renderBinary(), 260);
}, 1400);
setBinary('SOON');

/* ---------- Stream log ---------- */

const LOG_MESSAGES = [
  'booting countdown.exe ... ok',
  'warming up the microphone',
  'compiling this week\'s slides',
  'grab a snack, we start soon',
  'checking audio levels ... ok',
  'scan the QR: SA disclaimer form',
  'SA disclaimer form done?',
  'say hi to your table!',
  'fixing one last bug (promise)',
  'people > pixels',
  'rendering pixels at 60fps',
  'brewing coffee.js',
  'git pull --rebase ... ok',
  'npm install vibes',
  'aligning divs ... centred',
];
const log = $('log');
let logQueue = [];
let typing = false;

function shuffledMessages() {
  return [...LOG_MESSAGES].sort(() => Math.random() - 0.5);
}

function pushLog(text) {
  logQueue.push(text);
  if (!typing) typeNext();
}

function typeNext() {
  const text = logQueue.shift();
  if (!text) { typing = false; return; }
  typing = true;
  const li = document.createElement('li');
  li.className = 'typing';
  log.append(li);
  while (log.children.length > 2) log.firstElementChild.remove();
  const full = `> ${text}`;
  let i = 0;
  const step = () => {
    li.textContent = full.slice(0, ++i);
    if (i < full.length) setTimeout(step, 28 + Math.random() * 40);
    else { li.classList.remove('typing'); setTimeout(typeNext, 250); }
  };
  step();
}

let ambientPool = shuffledMessages();
function ambientLog() {
  if (state === 'running' && lastSecond > 15) {
    if (!ambientPool.length) ambientPool = shuffledMessages();
    pushLog(ambientPool.pop());
  }
}
setInterval(ambientLog, 7000);

/* ---------- Sound: calm ambient score, synthesised with Web Audio (no files needed) ---------- */

const Sound = (() => {
  let ctx, master, musicBus, padFilter, padLfo, keysBus, sfx, reverbIn;
  let muted = false;
  let musicTimer = null;
  let nextBeat = 0;
  let beat = 0;
  let lastKey = 2;
  let plucksBus, padPump, noiseBuffer;

  // Optional real track: drop a file at music.m4a (e.g. "Space Walk" from the YouTube Audio Library)
  // and it plays instead of the built-in synth score.
  const TRACK_VOLUME = 0.85;
  const track = new Audio('music.m4a');
  track.loop = true;
  track.preload = 'auto';
  let trackReady = false;
  let usingTrack = false;
  let trackFader = null;
  track.addEventListener('canplaythrough', () => { trackReady = true; }, { once: true });

  function fadeTrack(to, seconds, done) {
    clearInterval(trackFader);
    const from = track.volume;
    const started = performance.now();
    trackFader = setInterval(() => {
      const k = Math.min(1, (performance.now() - started) / (seconds * 1000));
      track.volume = from + (to - from) * k;
      if (k === 1) { clearInterval(trackFader); done?.(); }
    }, 50);
  }

  const BPM = 84;
  const BEAT = 60 / BPM;
  const BEATS_PER_CHORD = 8;
  const MUSIC_LEVEL = 1;
  const midi = n => 440 * 2 ** ((n - 69) / 12);

  // Bright, all-major progression in D: D, A/C#, G, A (with added 9ths).
  // Pad notes also drive the bouncy arpeggio; keys are the melody notes allowed over each chord.
  const CHORDS = [
    { bass: 38, pad: [62, 66, 69, 76], keys: [74, 76, 78, 81, 83, 86] },
    { bass: 37, pad: [61, 64, 69, 71], keys: [73, 76, 78, 81, 83, 85] },
    { bass: 43, pad: [59, 62, 67, 69], keys: [74, 76, 79, 81, 83, 86] },
    { bass: 45, pad: [61, 64, 69, 76], keys: [73, 76, 78, 81, 85, 88] },
  ];
  const ARP = [0, 2, 3, 1, 2, 3, 1, 2];

  function makeImpulse(seconds, decay) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
    return buffer;
  }

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp).connect(ctx.destination);

    // Long, dark hall reverb shared by everything.
    const predelay = ctx.createDelay(0.2);
    predelay.delayTime.value = 0.04;
    const convolver = ctx.createConvolver();
    convolver.buffer = makeImpulse(5, 2.6);
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 4200;
    const wet = ctx.createGain();
    wet.gain.value = 0.42;
    reverbIn = predelay;
    predelay.connect(convolver).connect(tone).connect(wet).connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0;
    musicBus.connect(master);
    const musicVerb = ctx.createGain();
    musicVerb.gain.value = 0.7;
    musicBus.connect(musicVerb).connect(reverbIn);

    // Pads go through one slowly breathing low-pass filter.
    padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 1500;
    padFilter.Q.value = 0.6;
    padLfo = ctx.createOscillator();
    padLfo.frequency.value = 0.06;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 400;
    padLfo.connect(lfoDepth).connect(padFilter.frequency);
    padLfo.start();
    // Gentle "pumping" on every beat gives the pads a pulse without any drums.
    padPump = ctx.createGain();
    padFilter.connect(padPump).connect(musicBus);

    // Plucky synth arpeggio with a stereo ping-pong echo, for that spacey premiere feel.
    plucksBus = ctx.createGain();
    plucksBus.connect(musicBus);
    const echoTone = ctx.createBiquadFilter();
    echoTone.type = 'lowpass';
    echoTone.frequency.value = 2800;
    plucksBus.connect(echoTone);
    [[BEAT * 0.75, -0.7], [BEAT * 0.5, 0.7]].forEach(([time, side]) => {
      const delay = ctx.createDelay(2);
      delay.delayTime.value = time;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.38;
      const pan = ctx.createStereoPanner();
      pan.pan.value = side;
      const level = ctx.createGain();
      level.gain.value = 0.5;
      echoTone.connect(delay);
      delay.connect(feedback).connect(delay);
      delay.connect(level).connect(pan).connect(musicBus);
    });

    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 2 - 1;

    keysBus = ctx.createGain();
    keysBus.gain.value = 1;
    keysBus.connect(musicBus);
    const keysVerb = ctx.createGain();
    keysVerb.gain.value = 0.5;
    keysBus.connect(keysVerb).connect(reverbIn);

    sfx = ctx.createGain();
    sfx.gain.value = 0.9;
    sfx.connect(master);
    const sfxVerb = ctx.createGain();
    sfxVerb.gain.value = 0.8;
    sfx.connect(sfxVerb).connect(reverbIn);
  }

  // Warm pad voice: two detuned saws and a triangle, slow fade in and out.
  function padNote(note, at, dur, gain, dest = padFilter) {
    const env = ctx.createGain();
    const attack = Math.min(2.2, dur / 3);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(gain, at + attack);
    env.gain.setValueAtTime(gain, at + dur);
    env.gain.linearRampToValueAtTime(0, at + dur + 3);
    env.connect(dest);
    [['sawtooth', -7], ['sawtooth', 7], ['triangle', 0]].forEach(([type, detune]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = midi(note);
      osc.detune.value = detune;
      osc.connect(env);
      osc.start(at);
      osc.stop(at + dur + 3.1);
    });
  }

  // Soft electric piano: gentle FM tine with a quick-fading brightness.
  function keyNote(note, at, velocity, dest = keysBus, length = 3.5) {
    const freq = midi(note);
    const carrier = ctx.createOscillator();
    carrier.frequency.value = freq;
    const mod = ctx.createOscillator();
    mod.frequency.value = freq;
    const modDepth = ctx.createGain();
    modDepth.gain.setValueAtTime(freq * 1.1 * velocity, at);
    modDepth.gain.exponentialRampToValueAtTime(freq * 0.05, at + 0.9);
    mod.connect(modDepth).connect(carrier.frequency);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(0.13 * velocity, at + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, at + length);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 0.6 - 0.3;
    carrier.connect(env).connect(pan).connect(dest);

    carrier.start(at);
    mod.start(at);
    carrier.stop(at + length + 0.05);
    mod.stop(at + length + 0.05);
  }

  // Glockenspiel-style sparkle: a short, bright bell.
  function bellNote(note, at, velocity, dest = keysBus) {
    const freq = midi(note);
    const carrier = ctx.createOscillator();
    carrier.frequency.value = freq;
    const mod = ctx.createOscillator();
    mod.frequency.value = freq * 3.5;
    const modDepth = ctx.createGain();
    modDepth.gain.setValueAtTime(freq * 0.8, at);
    modDepth.gain.exponentialRampToValueAtTime(freq * 0.01, at + 0.6);
    mod.connect(modDepth).connect(carrier.frequency);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(0.07 * velocity, at + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 2);
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 0.8 - 0.4;
    carrier.connect(env).connect(pan).connect(dest);
    carrier.start(at);
    mod.start(at);
    carrier.stop(at + 2.05);
    mod.stop(at + 2.05);
  }

  // Soft synth pluck: two detuned saws through a quickly closing filter.
  function pluckNote(note, at, velocity) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 2.5;
    filter.frequency.setValueAtTime(900 + 2600 * velocity, at);
    filter.frequency.exponentialRampToValueAtTime(420, at + 0.28);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(0.06 * velocity, at + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);
    filter.connect(env).connect(plucksBus);
    [-8, 8].forEach(detune => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = midi(note);
      osc.detune.value = detune;
      osc.connect(filter);
      osc.start(at);
      osc.stop(at + 0.6);
    });
  }

  // Airy riser: filtered noise sweeping up, like wind through a spacesuit visor.
  function airSwell(at, dur) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 1.2;
    band.frequency.setValueAtTime(400, at);
    band.frequency.exponentialRampToValueAtTime(5000, at + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(0.035, at + dur * 0.85);
    env.gain.linearRampToValueAtTime(0, at + dur);
    src.connect(band).connect(env).connect(musicBus);
    src.start(at);
    src.stop(at + dur + 0.05);
  }

  // Sine bass with a quieter octave on top so it still comes through laptop speakers.
  function bassNote(note, at, dur, dest = musicBus) {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(0.16, at + 0.4);
    env.gain.setValueAtTime(0.16, at + dur - 0.6);
    env.gain.linearRampToValueAtTime(0, at + dur + 1);
    env.connect(dest);
    [[note, 1], [note + 12, 0.35]].forEach(([n, level]) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = midi(n);
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(env);
      osc.start(at);
      osc.stop(at + dur + 1.1);
    });
  }

  // A melody that moves by small steps, leaning upwards, with some rests.
  function nextMelodyIndex(keys) {
    const step = [-2, -1, 1, 1, 2, 1][Math.floor(Math.random() * 6)];
    lastKey = Math.max(0, Math.min(keys.length - 1, lastKey + step));
    return lastKey;
  }

  function scheduleBeat(b, at) {
    const chordIndex = Math.floor(b / BEATS_PER_CHORD) % CHORDS.length;
    const chord = CHORDS[chordIndex];
    const pos = b % BEATS_PER_CHORD;
    const chordLength = BEAT * BEATS_PER_CHORD;

    if (pos === 0) {
      chord.pad.forEach(n => padNote(n, at, chordLength, 0.02));
      bassNote(chord.bass, at, chordLength);
      // Every fourth chord, an airy swell rises into the top of the loop.
      if (chordIndex === CHORDS.length - 1) airSwell(at, chordLength);
    }

    padPump.gain.setValueAtTime(0.45, at);
    padPump.gain.linearRampToValueAtTime(1, at + BEAT * 0.7);

    // Plucky eighth-note arpeggio an octave up, echoing left and right.
    [0, 0.5].forEach((offset, half) => {
      const step = (pos * 2 + half) % ARP.length;
      pluckNote(chord.pad[ARP[step]] + 12, at + offset * BEAT, half === 0 ? 0.8 : 0.55);
    });

    // Electric piano melody on top, with space between phrases.
    if (pos === 0 || Math.random() < 0.4) {
      keyNote(chord.keys[nextMelodyIndex(chord.keys)], at, 0.45 + Math.random() * 0.3);
      if (Math.random() < 0.25) keyNote(chord.keys[nextMelodyIndex(chord.keys)], at + BEAT / 2, 0.35 + Math.random() * 0.2);
    }

    // Sparkle: a little bell flourish now and then.
    if (pos === 6 && Math.random() < 0.6) {
      bellNote(chord.keys[3] + 12, at, 0.8);
      bellNote(chord.keys[5] + 12, at + BEAT / 2, 0.6);
    }
  }

  function scheduler() {
    while (nextBeat < ctx.currentTime + 0.25) {
      scheduleBeat(beat, nextBeat);
      nextBeat += BEAT;
      beat++;
    }
  }

  function rampTo(param, value, seconds) {
    const t = ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(value, t + seconds);
  }

  return {
    init,
    get muted() { return muted; },
    startMusic() {
      if (trackReady) {
        usingTrack = true;
        track.currentTime = 0;
        track.volume = 0;
        track.muted = muted;
        track.play().catch(() => {});
        fadeTrack(TRACK_VOLUME, 3);
        return;
      }
      if (!ctx || musicTimer) return;
      nextBeat = ctx.currentTime + 0.15;
      beat = 0;
      musicBus.gain.cancelScheduledValues(ctx.currentTime);
      musicBus.gain.setValueAtTime(0, ctx.currentTime);
      musicBus.gain.linearRampToValueAtTime(MUSIC_LEVEL, ctx.currentTime + 4);
      padFilter.frequency.cancelScheduledValues(ctx.currentTime);
      padFilter.frequency.setValueAtTime(1500, ctx.currentTime);
      musicTimer = setInterval(scheduler, 50);
      scheduler();
    },
    stopMusic(fade = 1.5) {
      if (usingTrack) {
        usingTrack = false;
        fadeTrack(0, fade, () => track.pause());
        return;
      }
      if (!ctx || !musicTimer) return;
      rampTo(musicBus.gain, 0, fade);
      const timer = musicTimer;
      musicTimer = null;
      setTimeout(() => clearInterval(timer), fade * 1000 + 200);
    },
    // Final ten seconds: the music slowly opens up and lifts, no beeps.
    swell() {
      if (usingTrack) return fadeTrack(1, 10);
      if (!ctx) return;
      rampTo(padFilter.frequency, 3200, 10);
      rampTo(musicBus.gain, MUSIC_LEVEL * 1.25, 10);
    },
    pause() {
      ctx?.suspend();
      if (usingTrack) track.pause();
    },
    resume() {
      ctx?.resume();
      if (usingTrack) track.play().catch(() => {});
    },
    toggleMute() {
      muted = !muted;
      if (ctx) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.05);
      track.muted = muted;
      return muted;
    },
    start() {
      if (trackReady) return; // the real track has its own intro
      const t = ctx.currentTime + 0.05;
      keyNote(81, t, 0.5, sfx, 4);
      keyNote(86, t + 0.18, 0.45, sfx, 5);
    },
    // The goose's raspberry: a low buzzy tone that wobbles in pitch, chopped by a fast flutter, with a bit of spit.
    raspberry() {
      if (!ctx || !sfx) return;
      const t = ctx.currentTime + 0.02, dur = 1.5;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.32, t + 0.06);
      env.gain.setValueAtTime(0.32, t + dur - 0.3);
      env.gain.linearRampToValueAtTime(0, t + dur);
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 1100;
      const flutter = ctx.createGain();
      flutter.gain.value = 0.55;
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(34, t);
      lfo.frequency.linearRampToValueAtTime(22, t + dur);
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.45;
      lfo.connect(lfoDepth).connect(flutter.gain);
      const buzz = ctx.createOscillator();
      buzz.type = 'sawtooth';
      buzz.frequency.setValueAtTime(110, t);
      buzz.frequency.linearRampToValueAtTime(78, t + dur);
      const hiss = ctx.createBufferSource();
      hiss.buffer = noiseBuffer;
      hiss.loop = true;
      const hissBand = ctx.createBiquadFilter();
      hissBand.type = 'bandpass';
      hissBand.frequency.value = 1800;
      hissBand.Q.value = 0.7;
      const hissLevel = ctx.createGain();
      hissLevel.gain.value = 0.5;
      buzz.connect(flutter);
      hiss.connect(hissBand).connect(hissLevel).connect(flutter);
      flutter.connect(env).connect(tone).connect(sfx);
      [lfo, buzz, hiss].forEach(n => { n.start(t); n.stop(t + dur + 0.05); });
    },
    minuteChime() {
      if (usingTrack) return; // a chime in another key would clash with the track
      const t = ctx.currentTime + 0.05;
      [74, 78, 81].forEach((n, i) => keyNote(n, t + i * 0.22, 0.4, sfx, 4));
    },
    // Going live: one warm D major 9 bloom with a rising chime on top.
    fanfare() {
      const t = ctx.currentTime + 0.05;
      const warm = ctx.createBiquadFilter();
      warm.type = 'lowpass';
      warm.frequency.setValueAtTime(600, t);
      warm.frequency.linearRampToValueAtTime(1800, t + 2.5);
      warm.connect(sfx);
      [50, 57, 62, 66, 69, 76].forEach(n => padNote(n, t, 3.5, 0.03, warm));
      bassNote(38, t, 4, sfx);
      [62, 66, 69, 73, 76, 81, 86].forEach((n, i) => keyNote(n, t + 0.1 + i * 0.13, 0.55, sfx, 5));
    },
  };
})();

/* ---------- Timer ---------- */

let totalMs = defaultMinutes * 60000;
let remainingMs = totalMs;
let endAt = 0;
let state = 'ready'; // ready | running | paused | live
let lastSecond = null;

const pad = n => String(n).padStart(2, '0');

function renderClock(seconds) {
  const m = Math.min(99, Math.floor(seconds / 60));
  const s = seconds % 60;
  const digits = `${pad(m)}${pad(s)}`;
  clockDigits.forEach((el, i) => setDigit(el, digits[i]));
  $('clock').setAttribute('aria-label', `${m} minutes ${s} seconds remaining`);
  document.title = state === 'live' ? 'CSS Weekly — Live now' : `${pad(m)}:${pad(s)} — CSS Weekly starting soon`;
}

function renderProgress() {
  const progress = totalMs ? 1 - remainingMs / totalMs : 1;
  const filled = Math.floor(progress * SEGMENTS);
  segments.forEach((seg, i) => {
    seg.classList.toggle('on', i < filled);
    seg.classList.toggle('head', i === filled && state !== 'live');
  });
  $('percent').textContent = `${Math.floor(progress * 100)}%`;
}

function renderStartTime() {
  const at = state === 'running' ? new Date(Date.now() + remainingMs) : null;
  const label = at ? `Today · live at ${pad(at.getHours())}:${pad(at.getMinutes())}` : state === 'live' ? 'On air now · welcome!' : `Live in ${Math.round(totalMs / 60000)} min`;
  $('startsAt').textContent = `${label} →`;
}

function showFinal(seconds) {
  screen.classList.add('is-final');
  const text = String(seconds);
  finalDigits[1].hidden = text.length < 2;
  setDigit(finalDigits[0], text[0]);
  if (text.length > 1) setDigit(finalDigits[1], text[1]);
  const wrap = $('finalDigits');
  wrap.classList.remove('pop');
  void wrap.offsetWidth;
  wrap.classList.add('pop');
  const ring = screen.querySelector('.final-ring');
  ring.classList.remove('pulse');
  void ring.offsetWidth;
  ring.classList.add('pulse');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    screen.animate([
      { transform: 'translate(0,0)' }, { transform: 'translate(-4px,3px)' },
      { transform: 'translate(4px,-2px)' }, { transform: 'translate(0,0)' },
    ], { duration: 220, easing: 'steps(4)' });
  }
}

function onSecond(seconds, silent) {
  renderClock(seconds);
  if (silent) return;
  if (seconds <= 10 && seconds > 0) {
    if (seconds === 10) { Sound.swell(); pushLog('going live in 10 ...'); setBinary('GO!'); }
    showFinal(seconds);
  } else if (seconds > 10 && seconds % 60 === 0) {
    const mins = seconds / 60;
    Sound.minuteChime();
    pushLog(`T-minus ${mins} minute${mins === 1 ? '' : 's'}`);
  }
  if (seconds === 0) goLive();
}

function update() {
  if (state !== 'running') return;
  remainingMs = Math.max(0, endAt - performance.now());
  const seconds = Math.ceil(remainingMs / 1000);
  if (seconds !== lastSecond) {
    lastSecond = seconds;
    onSecond(seconds, false);
  }
  $('colon').classList.toggle('dim', remainingMs % 1000 < 500);
  renderProgress();
}
setInterval(update, 50);

function burstConfetti() {
  const box = $('confetti');
  box.innerHTML = Array.from({ length: 90 }, () => {
    const angle = rand(0, Math.PI * 2);
    const dist = rand(250, 750);
    const style = [
      `--s:${Math.round(rand(8, 20))}px`,
      `--c:${pick(palette)}`,
      `--d:${rand(1.4, 2.8).toFixed(2)}s`,
      `--x:${Math.round(Math.cos(angle) * dist)}px`,
      `--y:${Math.round(Math.sin(angle) * dist * 0.7 + 160)}px`,
      `--r:${Math.round(rand(-540, 540))}deg`,
    ].join(';');
    return `<i style="${style}"></i>`;
  }).join('');
  setTimeout(() => { box.innerHTML = ''; }, 3200);
}

function goLive() {
  state = 'live';
  remainingMs = 0;
  screen.classList.remove('is-final');
  screen.classList.add('is-live');
  $('headline').innerHTML = 'Welcome to CSS,<br><em>future builders.</em>';
  $('subtitle').textContent = 'Thanks for waiting. We don\'t code, we build!';
  $('windowFile').textContent = 'live_now.exe';
  setBinary('LIVE');
  $('colon').classList.remove('dim');
  renderClock(0);
  renderProgress();
  renderStartTime();
  pushLog('welcome, future builders!');
  Sound.stopMusic(2.5);
  Sound.fanfare();
  burstConfetti();
  syncControls();
}

function start() {
  if (state !== 'ready') return;
  document.activeElement?.blur();
  Sound.init();
  Sound.resume();
  $('startOverlay').classList.add('gone');
  state = 'running';
  endAt = performance.now() + remainingMs;
  lastSecond = Math.ceil(remainingMs / 1000);
  renderStartTime();
  Sound.start();
  Sound.startMusic();
  pushLog('countdown started');
  syncControls();
}

function togglePause() {
  if (state === 'ready') return start();
  if (state === 'running') {
    remainingMs = Math.max(0, endAt - performance.now());
    state = 'paused';
    Sound.pause();
    $('windowFile').textContent = 'countdown.exe [paused]';
    $('colon').classList.remove('dim');
  } else if (state === 'paused') {
    state = 'running';
    endAt = performance.now() + remainingMs;
    Sound.resume();
    $('windowFile').textContent = 'countdown.exe';
  }
  renderStartTime();
  syncControls();
}

function reset() {
  const wasStarted = state !== 'ready';
  Sound.stopMusic(0.3);
  Sound.resume();
  remainingMs = totalMs;
  lastSecond = null;
  screen.classList.remove('is-final', 'is-live');
  $('headline').innerHTML = 'Starting<br><em>soon.</em>';
  $('subtitle').textContent = 'Scan the QR code and fill in the SA disclaimer form. We start when the clock hits zero.';
  $('windowFile').textContent = 'countdown.exe';
  setBinary('SOON');
  state = 'ready';
  renderClock(Math.ceil(totalMs / 1000));
  renderProgress();
  renderStartTime();
  if (wasStarted) setTimeout(start, 350);
  syncControls();
}

function adjustMinutes(delta) {
  if (state === 'live') return;
  const next = Math.min(99 * 60000, Math.max(60000, (state === 'ready' ? totalMs : remainingMs) + delta * 60000));
  if (state === 'ready') {
    totalMs = next;
    remainingMs = next;
    $('durationLabel').textContent = `${Math.round(next / 60000)} MIN`;
    renderClock(Math.ceil(next / 1000));
  } else {
    totalMs = Math.max(totalMs, next);
    remainingMs = next;
    endAt = performance.now() + remainingMs;
    lastSecond = Math.ceil(remainingMs / 1000);
    if (lastSecond > 10) screen.classList.remove('is-final');
    renderClock(lastSecond);
  }
  renderProgress();
  renderStartTime();
}

/* ---------- Controls ---------- */

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    // Some embedded browsers do not expose the Fullscreen API.
  }
}

function syncControls() {
  const play = $('playButton');
  const paused = state !== 'running';
  play.textContent = paused ? '▶' : '❚❚';
  play.setAttribute('aria-label', paused ? 'Play' : 'Pause');
  play.title = paused ? 'Play (Space)' : 'Pause (Space)';
  const mute = $('muteButton');
  mute.classList.toggle('off', Sound.muted);
  mute.setAttribute('aria-label', Sound.muted ? 'Unmute' : 'Mute');
}

function toggleMute() {
  Sound.toggleMute();
  syncControls();
}

$('startButton').addEventListener('click', start);
$('playButton').addEventListener('click', () => { if (state !== 'live') togglePause(); });
$('muteButton').addEventListener('click', toggleMute);
$('resetButton').addEventListener('click', reset);
$('fullscreenButton').addEventListener('click', toggleFullscreen);

document.addEventListener('keydown', event => {
  if (event.target.closest('button') && (event.key === ' ' || event.key === 'Enter')) return;
  const key = event.key.toLowerCase();
  if (key === ' ' || key === 'enter') { event.preventDefault(); if (state !== 'live') togglePause(); }
  else if (key === 'm') toggleMute();
  else if (key === 'f') void toggleFullscreen();
  else if (key === 'r') reset();
  else if (key === 'arrowup') { event.preventDefault(); adjustMinutes(1); }
  else if (key === 'arrowdown') { event.preventDefault(); adjustMinutes(-1); }
});

// Hide the cursor and control buttons after a few idle seconds so the screen is clean for streaming.
let idleTimer;
function wake() {
  document.body.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { if (state !== 'ready') document.body.classList.add('idle'); }, 2500);
}
['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(type => document.addEventListener(type, wake, { passive: true }));

/* ---------- Initial render ---------- */

$('durationLabel').textContent = `${defaultMinutes} MIN`;
renderClock(defaultMinutes * 60);
renderProgress();
renderStartTime();
syncControls();
pushLog('countdown.exe loaded');
pushLog('scan the QR code to sign in');
$('startButton').focus();

/* ---------- Easter egg: a goose runs by every minute, stares at the screen and blows a raspberry ---------- */

const GOOSE = (() => {
  const CELL = 8;
  const PALETTE = { W: '#fbfaf6', G: '#cfcde0', O: '#f0a040', K: '#2b2a3a', P: '#f1a1db', R: '#d9609f' };

  // Side view, facing right; the legs have two frames so it really runs.
  const BODY = [
    '..............WWW...',
    '.............WWWWOO.',
    '.............WKWWOOO',
    '.............WWWWOO.',
    '..............WWW...',
    '..............WW....',
    '.............WWW....',
    '............WWW.....',
    '...WWWWWWWWWWW......',
    '..WWWWWWWWWWWWW.....',
    '.WWWWWWWWWWWWWWW....',
    'WWWWWGGWWWWWWWWW....',
    '.WWWGGGGWWWWWWW.....',
    '..WWWWWWWWWWWW......',
    '....WWWWWWWWW.......',
  ];
  const LEGS_A = ['.......O....O......', '......O......O.....', '.....OO.....OOO....'];
  const LEGS_B = ['........O..O.......', '........O..O.......', '.......OOO.OOO.....'];

  // Front view: it turns to look straight at you. The tongue is its own sprite so it can wobble.
  const FRONT = [
    '......WWWW......',
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '....WWWWWWWW....',
    '....WKWWWWKW....',
    '....WWWWWWWW....',
    '....WWOOOOWW....',
    '.....OOOOOO.....',
    '.....WOOOOW.....',
    '......WWWW......',
    '......WWWW......',
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '...WWGWWWWGWW...',
    '...WWGWWWWGWW...',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '......O..O......',
    '......O..O......',
    '.....OOO.OOO....',
  ];
  const TONGUE = ['PPPP', 'PPPP', 'PRRP', '.PP.'];

  function svg(rows, cls) {
    const w = rows[0].length, h = rows.length, groups = {};
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (PALETTE[ch]) (groups[ch] = groups[ch] || []).push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }));
    const body = Object.keys(groups).map(c => `<g fill="${PALETTE[c]}">${groups[c].join('')}</g>`).join('');
    return `<svg class="${cls}" width="${w * CELL}" height="${h * CELL}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`;
  }

  const el = document.createElement('div');
  el.className = 'goose';
  el.setAttribute('aria-hidden', 'true');
  let spit = '';
  for (let i = 0; i < 9; i++) {
    const angle = -0.9 + (i / 8) * 1.8;
    spit += `<i style="--dx:${Math.round(Math.sin(angle) * 150 + 40)}px;--dy:${Math.round(-Math.cos(angle) * 110 - 10)}px;--d:${(i % 3) * 0.12}s"></i>`;
  }
  el.innerHTML =
    svg(BODY.concat(LEGS_A), 'sp side a') + svg(BODY.concat(LEGS_B), 'sp side b') +
    '<div class="sp front">' + svg(FRONT, 'front-body') + svg(TONGUE, 'tongue') + '</div>' +
    '<span class="bubble">pbbbbbt!</span><span class="spit">' + spit + '</span>';
  screen.appendChild(el);

  let busy = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const after = (ms, fn) => setTimeout(fn, ms);

  function run() {
    if (busy || reduced()) return;
    busy = true;
    el.className = 'goose run';
    el.style.transition = 'none';
    el.style.left = '-200px';
    void el.offsetWidth;
    el.style.transition = 'left 2.4s linear';
    el.style.left = '580px';
    after(2400, () => { el.className = 'goose stare'; });                       // skids to a stop and turns to look at you
    after(3300, () => { el.className = 'goose stare blow'; Sound.raspberry(); }); // blows the raspberry
    after(5500, () => { el.className = 'goose stare'; });
    after(6200, () => {                                                           // turns away and runs off
      el.className = 'goose run';
      el.style.transition = 'left 2.2s linear';
      el.style.left = '1500px';
    });
    after(8500, () => { el.className = 'goose'; busy = false; });
  }

  return { run, get busy() { return busy; } };
})();

// Once a minute of running time (not while paused), as long as the countdown isn't nearly over.
// Add ?goose=10 to the address for a visit every 10 seconds; press G to call the goose yourself.
const GOOSE_EVERY = Math.max(5, Number(new URLSearchParams(location.search).get('goose')) || 60);
let gooseClock = 0;
setInterval(() => {
  if (state === 'ready') { gooseClock = 0; return; }
  if (state !== 'running') return;
  gooseClock += 1;
  if (gooseClock >= GOOSE_EVERY && lastSecond > 20 && !GOOSE.busy) { gooseClock = 0; GOOSE.run(); }
}, 1000);
document.addEventListener('keydown', event => {
  if (event.key.toLowerCase() === 'g' && !event.metaKey && !event.ctrlKey && !event.altKey) GOOSE.run();
});
