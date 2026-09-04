import fs from "node:fs";
import path from "node:path";

const SAMPLE_RATE = 22050;
const BPM = 96;
const BEATS = 16;
const DURATION = (BEATS * 60) / BPM;
const SAMPLE_COUNT = Math.floor(SAMPLE_RATE * DURATION);

function clampSample(value) {
  return Math.max(-1, Math.min(1, value));
}

function envelope(time, attack, decay) {
  if (time < 0) {
    return 0;
  }
  if (time < attack) {
    return time / attack;
  }
  return Math.exp(-(time - attack) / decay);
}

function noteHz(name) {
  const table = {
    D3: 146.83,
    A3: 220,
    D4: 293.66,
    E4: 329.63,
    G4: 392,
    A4: 440,
    C5: 523.25,
    D5: 587.33,
  };
  return table[name];
}

function flute(time, freq) {
  const vib = freq * (1 + 0.006 * Math.sin(2 * Math.PI * 4.6 * time));
  const breath = (Math.random() * 2 - 1) * 0.04 * envelope(time, 0.02, 0.4);
  const tone =
    Math.sin(2 * Math.PI * vib * time) * 0.72 +
    Math.sin(2 * Math.PI * vib * 2 * time) * 0.12;
  return (tone + breath) * envelope(time, 0.035, 0.42);
}

function drone(time, freq) {
  return (
    Math.sin(2 * Math.PI * freq * time) * 0.22 +
    Math.sin(2 * Math.PI * freq * 0.5 * time) * 0.12
  );
}

function dhol(time) {
  const boom =
    Math.sin(2 * Math.PI * 72 * Math.exp(-time * 7) * time) *
    envelope(time, 0.004, 0.16);
  const slap =
    ((Math.random() * 2 - 1) * 0.55 + Math.sin(2 * Math.PI * 190 * time) * 0.35) *
    envelope(time, 0.002, 0.06);
  return boom * 0.85 + slap * 0.4;
}

function windBed(time) {
  let lp = windBed.lp ?? 0;
  const white = Math.random() * 2 - 1;
  lp = lp * 0.94 + white * 0.06;
  windBed.lp = lp;
  const gust = 0.7 + 0.3 * Math.sin(2 * Math.PI * time * 0.11);
  return lp * gust * 0.18;
}

function drip(time) {
  const ping = Math.sin(2 * Math.PI * (980 - time * 420) * time);
  return ping * envelope(time, 0.004, 0.07) * 0.12;
}

function addAt(samples, beat, fn, gain) {
  const start = Math.floor((beat * 60 * SAMPLE_RATE) / BPM);
  for (let index = 0; index < SAMPLE_RATE * 2; index += 1) {
    const sampleIndex = start + index;
    if (sampleIndex >= samples.length) {
      break;
    }
    samples[sampleIndex] += fn(index / SAMPLE_RATE) * gain;
  }
}

const samples = new Float32Array(SAMPLE_COUNT);

for (let index = 0; index < SAMPLE_COUNT; index += 1) {
  const time = index / SAMPLE_RATE;
  samples[index] += drone(time, noteHz("D3")) * 0.55;
  samples[index] += drone(time, noteHz("A3")) * 0.28;
  samples[index] += windBed(time);
}

const melody = [
  [0, "D4"],
  [1, "E4"],
  [2, "G4"],
  [3.5, "A4"],
  [4, "G4"],
  [5, "E4"],
  [6, "D4"],
  [7.5, "A3"],
  [8, "G4"],
  [9, "A4"],
  [10, "C5"],
  [11.5, "A4"],
  [12, "G4"],
  [13, "E4"],
  [14, "D4"],
  [15.5, "D4"],
];

for (const [beat, name] of melody) {
  const freq = noteHz(name);
  addAt(samples, beat, (time) => flute(time, freq), 0.62);
}

for (let beat = 0; beat < BEATS; beat += 2) {
  addAt(samples, beat, dhol, beat % 4 === 0 ? 0.7 : 0.48);
}
addAt(samples, 1.5, dhol, 0.28);
addAt(samples, 5.5, dhol, 0.28);
addAt(samples, 9.5, dhol, 0.28);
addAt(samples, 13.5, dhol, 0.28);

for (const beat of [0.75, 3.2, 6.1, 8.4, 11.7, 14.2]) {
  addAt(samples, beat, drip, 1);
}

let peak = 0.0001;
for (let index = 0; index < samples.length; index += 1) {
  peak = Math.max(peak, Math.abs(samples[index]));
}
const norm = 0.78 / peak;
const fade = 0.08 * SAMPLE_RATE;
for (let index = 0; index < SAMPLE_COUNT; index += 1) {
  let edge = 1;
  if (index < fade) {
    edge = index / fade;
  } else if (index > SAMPLE_COUNT - fade) {
    edge = (SAMPLE_COUNT - index) / fade;
  }
  samples[index] = clampSample(samples[index] * norm * edge);
}

const pcm = Buffer.alloc(SAMPLE_COUNT * 2);
for (let index = 0; index < SAMPLE_COUNT; index += 1) {
  pcm.writeInt16LE(Math.round(samples[index] * 32767), index * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const outDir = path.join(process.cwd(), "public", "audio");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "folk-loop.wav");
fs.writeFileSync(outPath, Buffer.concat([header, pcm]));
console.log(`Wrote ${outPath} (${DURATION.toFixed(2)}s)`);
