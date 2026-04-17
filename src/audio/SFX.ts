/**
 * REDLINE FC — Sound Effects (Web Audio API)
 * Procedural audio for all game events.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let vuvuzelaStarted = false;

export function initAudio(): void {
  if (audioCtx) return;
  audioCtx = new AudioContext();
  masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
}

export function setVolume(v: number): void {
  if (masterGain) masterGain.gain.value = v;
}

export function startUnstoppableVuvuzela(): void {
  if (!audioCtx || vuvuzelaStarted) return;

  const now = audioCtx.currentTime;
  const buzzGain = audioCtx.createGain();
  buzzGain.gain.value = 0.22;

  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 6;

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 18;

  const hornA = audioCtx.createOscillator();
  hornA.type = 'sawtooth';
  hornA.frequency.value = 233;

  const hornB = audioCtx.createOscillator();
  hornB.type = 'square';
  hornB.frequency.value = 466;

  const drift = audioCtx.createOscillator();
  drift.type = 'triangle';
  drift.frequency.value = 0.2;
  const driftGain = audioCtx.createGain();
  driftGain.gain.value = 8;

  lfo.connect(lfoGain);
  lfoGain.connect(hornA.frequency);
  lfoGain.connect(hornB.frequency);

  drift.connect(driftGain);
  driftGain.connect(hornA.detune);
  driftGain.connect(hornB.detune);

  hornA.connect(buzzGain);
  hornB.connect(buzzGain);
  buzzGain.connect(audioCtx.destination);

  lfo.start(now);
  drift.start(now);
  hornA.start(now);
  hornB.start(now);

  vuvuzelaStarted = true;
}

function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.1, attack = 0.005, release = 0.05): void {
  if (!audioCtx || !masterGain) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + attack);
  g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur - release);
  osc.connect(g);
  g.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

function playNoise(dur: number, vol = 0.1, lpFreq = 1000, hpFreq = 200): void {
  if (!audioCtx || !masterGain) return;
  const bufSize = Math.floor(audioCtx.sampleRate * dur);
  const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = lpFreq;
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = hpFreq;
  const g = audioCtx.createGain();
  g.gain.value = vol;
  g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
  src.connect(lp);
  lp.connect(hp);
  hp.connect(g);
  g.connect(masterGain);
  src.start();
}

export const SFX = {
  kick()       { playTone(180, .15, 'triangle', .2, .005, .1); playNoise(.08, .12, 400, 2000); },
  passShort()  { playTone(320, .1, 'sine', .1, .005, .08); },
  passDriven() { playTone(260, .12, 'triangle', .14, .005, .1); playNoise(.06, .06, 300, 1500); },
  passThrough(){ playTone(400, .08, 'sine', .09, .003, .06); playTone(500, .06, 'sine', .07, .005, .05); },
  shoot()      { playTone(120, .25, 'sawtooth', .18, .005, .2); playNoise(.12, .15, 200, 3000); },
  goal()       { playTone(523, .1, 'square', .15); setTimeout(() => playTone(659, .1, 'square', .15), 100); setTimeout(() => playTone(784, .3, 'square', .18), 200); playNoise(.5, .1, 100, 800); },
  tackle()     { playNoise(.15, .2, 100, 1500); playTone(80, .12, 'sawtooth', .15); },
  foul()       { playTone(880, .5, 'sine', .2, .01, .4); setTimeout(() => playTone(880, .3, 'sine', .15), 600); },
  whistle()    { playTone(2200, .15, 'sine', .12); setTimeout(() => playTone(2400, .25, 'sine', .15), 180); },
  click()      { playTone(800, .06, 'sine', .08); },
  meter()      { playTone(440, .08, 'sine', .1); playTone(660, .08, 'sine', .1); },
  combo()      { playTone(880, .06, 'sine', .08); playTone(1100, .06, 'sine', .06); },
  crowd(intensity = 0.5) { playNoise(.3, .05 * intensity, 80, 600); },
  save()       { playTone(200, .2, 'triangle', .12); playNoise(.1, .1, 300, 1500); },
  bounce()     { playTone(400, .06, 'triangle', .08); },
  possChange() { playTone(600, .05, 'sine', .06); playTone(700, .04, 'sine', .05); },
  trick()      { playTone(700, .08, 'sine', .08); playTone(900, .06, 'sine', .06); },
  special()    { playTone(440, .1, 'square', .12); playTone(660, .1, 'square', .1); playTone(880, .15, 'square', .12); },
  intercept()  { playTone(250, .1, 'triangle', .1); playNoise(.08, .08, 300, 1200); },
  heavyTouch() { playTone(150, .1, 'triangle', .08); playNoise(.06, .06, 200, 800); },
  gkSave()     { playTone(300, .25, 'triangle', .15); playNoise(.15, .12, 200, 2000); playTone(450, .1, 'sine', .1); },
  dash()       { playTone(500, .08, 'sine', .1); playTone(700, .06, 'sine', .08); playNoise(.1, .1, 400, 3000); },
};
