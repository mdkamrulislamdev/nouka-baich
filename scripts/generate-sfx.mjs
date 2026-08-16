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

fs.mkdirSync(path.join(process.cwd(), "public", "audio"), { recursive: true });
writeWav("sfx-row.wav", row);
writeWav("sfx-splash.wav", splash);
writeWav("sfx-crash.wav", crash);
writeWav("sfx-near-miss.wav", nearMiss);
