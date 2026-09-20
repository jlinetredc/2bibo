// Original soft sine tones; regenerate with Node. No external audio assets.
import { mkdirSync, writeFileSync } from "node:fs";
const rate = 22050;
mkdirSync("public/audio", { recursive: true });
for (const [name, notes] of [["place", [523.25]], ["celebrate", [523.25, 659.25, 783.99]]]) {
  const samplesPerNote = Math.floor(rate * 0.12);
  const count = notes.length * samplesPerNote;
  const wav = Buffer.alloc(44 + count * 2);
  wav.write("RIFF", 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write("data", 36); wav.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) {
    const local = i % samplesPerNote;
    const envelope = Math.sin(Math.PI * local / samplesPerNote) ** 2;
    const sample = Math.sin(2 * Math.PI * notes[Math.floor(i / samplesPerNote)] * local / rate) * envelope * 0.12;
    wav.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  writeFileSync(`public/audio/blocks-${name}.wav`, wav);
}
