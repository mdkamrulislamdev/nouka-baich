import fs from "node:fs";
import path from "node:path";

const SAMPLE_RATE = 22050;

function writeWav(name, samples) {
  const pcm = Buffer.alloc(samples.length * 2);
  for (let index = 0; index < samples.length; index += 1) {
    const clipped = Math.max(-1, Math.min(1, samples[index]));
    pcm.writeInt16LE(Math.round(clipped * 32767), index * 2);
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
  const outPath = path.join(process.cwd(), "public", "audio", name);
  fs.writeFileSync(outPath, Buffer.concat([header, pcm]));
  console.log(`Wrote ${outPath}`);
}

function env(time, attack, decay) {
  if (time < 0) {
    return 0;
  }
  if (time < attack) {
    return time / attack;
  }
  return Math.exp(-(time - attack) / decay);
}

function render(seconds, fn) {
  const count = Math.floor(SAMPLE_RATE * seconds);
  const samples = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    samples[index] = fn(index / SAMPLE_RATE);
  }
  return samples;
}

const row = render(0.22, (time) => {
  const wood = Math.sin(2 * Math.PI * 180 * time) * env(time, 0.004, 0.09);
  const knock = Math.sin(2 * Math.PI * 92 * time) * env(time, 0.003, 0.07);
  return (wood * 0.45 + knock * 0.55) * 0.9;
});

const splash = render(0.35, (time) => {
  const noise = (Math.random() * 2 - 1) * env(time, 0.01, 0.16);
  const bubble = Math.sin(2 * Math.PI * (420 + time * 90) * time) * env(time, 0.008, 0.12);
  return noise * 0.7 + bubble * 0.28;
});

const crash = render(0.55, (time) => {
  const thud = Math.sin(2 * Math.PI * 70 * Math.exp(-time * 4) * time) * env(time, 0.003, 0.22);
  const crack = (Math.random() * 2 - 1) * env(time, 0.002, 0.12);
  return thud * 0.7 + crack * 0.45;
});

const nearMiss = render(0.28, (time) => {
  const whoosh = (Math.random() * 2 - 1) * env(time, 0.02, 0.1);
  const tone = Math.sin(2 * Math.PI * (520 - time * 380) * time) * env(time, 0.01, 0.14);
  return whoosh * 0.55 + tone * 0.35;
});

const kick = render(0.42, (time) => {
  const thud = Math.sin(2 * Math.PI * 88 * Math.exp(-time * 5.5) * time) * env(time, 0.003, 0.14);
  const wood = Math.sin(2 * Math.PI * 210 * time) * env(time, 0.002, 0.08);
  const slap = (Math.random() * 2 - 1) * env(time, 0.004, 0.09);
  const spray = (Math.random() * 2 - 1) * env(time - 0.04, 0.012, 0.14);
  return thud * 0.55 + wood * 0.32 + slap * 0.4 + spray * 0.28;
});

let windFilter = 0;
const wind = render(5.2, (time) => {
  const white = Math.random() * 2 - 1;
  windFilter = windFilter * 0.93 + white * 0.07;
  const gust = 0.7 + 0.3 * Math.sin(2 * Math.PI * time * 0.28);
  const fade = Math.min(1, time / 0.14, (5.2 - time) / 0.14);
  return windFilter * gust * fade * 1.2;
});

const bump = render(0.48, (time) => {
  const wood = Math.sin(2 * Math.PI * 110 * Math.exp(-time * 8) * time) * env(time, 0.002, 0.12);
  const clonk = Math.sin(2 * Math.PI * 240 * time) * env(time, 0.003, 0.08);
  const squeak = Math.sin(2 * Math.PI * (520 + Math.sin(time * 40) * 180) * time) * env(time, 0.01, 0.16);
  const honk = Math.sin(2 * Math.PI * (340 - time * 90) * time) * env(time - 0.05, 0.012, 0.14);
  const spray = (Math.random() * 2 - 1) * env(time, 0.006, 0.1);
  return wood * 0.7 + clonk * 0.35 + squeak * 0.32 + honk * 0.28 + spray * 0.22;
});

let waterFilter = 0;
const water = render(4.6, (time) => {
  const white = Math.random() * 2 - 1;
  waterFilter = waterFilter * 0.86 + white * 0.14;
  const lap = Math.sin(2 * Math.PI * (1.4 + 0.35 * Math.sin(time * 0.7)) * time) * 0.08;
  const drop =
    Math.sin(2 * Math.PI * (820 - (time % 0.9) * 260) * time) *
    env(time % 0.9, 0.004, 0.05) *
    0.09;
  const fade = Math.min(1, time / 0.12, (4.6 - time) / 0.12);
  return (waterFilter * 0.22 + lap + drop) * fade;
});

fs.mkdirSync(path.join(process.cwd(), "public", "audio"), { recursive: true });
writeWav("sfx-row.wav", row);
writeWav("sfx-splash.wav", splash);
writeWav("sfx-crash.wav", crash);
writeWav("sfx-near-miss.wav", nearMiss);
writeWav("sfx-kick.wav", kick);
writeWav("sfx-wind.wav", wind);
writeWav("sfx-bump.wav", bump);
writeWav("sfx-water.wav", water);
