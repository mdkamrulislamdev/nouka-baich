import fs from "node:fs";
import path from "node:path";

const SAMPLE_RATE = 44100;
const BPM = 128;
const BEATS = 8;
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

function bassDrum(time) {
  const env = envelope(time, 0.004, 0.18);
  const pitch = 92 * Math.exp(-time * 6.5);
  return env * Math.sin(2 * Math.PI * pitch * time) * 0.95;
}

function slapDrum(time) {
  const env = envelope(time, 0.002, 0.07);
  const tone = Math.sin(2 * Math.PI * 210 * time);
  const noise = (Math.random() * 2 - 1) * 0.55;
  return env * (tone * 0.45 + noise * 0.55) * 0.7;
}

function click(time) {
  const env = envelope(time, 0.001, 0.03);
  return env * (Math.random() * 2 - 1) * 0.35;
}

function schedule(samples, beats, fn, gain) {
  for (const beat of beats) {
    const start = Math.floor((beat * 60 * SAMPLE_RATE) / BPM);
    for (let index = 0; index < SAMPLE_RATE; index += 1) {
      const sampleIndex = start + index;
      if (sampleIndex >= samples.length) {
        break;
      }
      const time = index / SAMPLE_RATE;
      samples[sampleIndex] += fn(time) * gain;
    }
  }
}

const samples = new Float32Array(SAMPLE_COUNT);

schedule(samples, [0, 2, 4, 6], bassDrum, 1);
schedule(samples, [1, 3, 5, 7], bassDrum, 0.72);
schedule(
  samples,
  [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5],
  slapDrum,
  0.9,
);
schedule(samples, [0.25, 1.25, 2.75, 4.25, 6.75], slapDrum, 0.55);
schedule(samples, [0, 1, 2, 3, 4, 5, 6, 7], click, 0.4);

let peak = 0.0001;
for (let index = 0; index < samples.length; index += 1) {
  peak = Math.max(peak, Math.abs(samples[index]));
}
const norm = 0.86 / peak;
for (let index = 0; index < samples.length; index += 1) {
  samples[index] = clampSample(samples[index] * norm);
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
