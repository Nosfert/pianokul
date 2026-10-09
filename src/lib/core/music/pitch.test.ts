import { describe, expect, it } from 'vitest';
import { detectPitch, freqToMidi, freqToMidiFloat, median } from './pitch';
import { NoteTracker } from './noteTracker';
import { midiToFrequency } from '$lib/audio/synth';

const SR = 48000;
const FRAME = 2048;

/** Seeded noise so tests are deterministic. */
function noise(seed: number) {
	let s = seed;
	return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
}

/**
 * Piano-ish tone: 8 slightly stretched partials where the 2nd and 3rd are
 * LOUDER than the fundamental (typical for mid/low piano strings), plus noise.
 */
function pianoTone(freq: number, start: number, length = FRAME, amp = 0.3, decay = 1.5, noiseLevel = 0.01, seed = 1) {
	const out = new Float32Array(length);
	const weights = [0.6, 1, 0.8, 0.5, 0.35, 0.25, 0.15, 0.1];
	const rnd = noise(seed);
	const B = 0.0004; // inharmonicity
	for (let i = 0; i < length; i++) {
		const t = (start + i) / SR;
		let v = 0;
		for (let k = 1; k <= weights.length; k++) {
			const fk = k * freq * Math.sqrt(1 + B * k * k);
			if (fk > SR / 2) break;
			v += weights[k - 1] * Math.sin(2 * Math.PI * fk * t) * Math.exp(-t * decay * k);
		}
		out[i] = amp * v * 0.4 + noiseLevel * rnd();
	}
	return out;
}

describe('detectPitch', () => {
	it('finds the fundamental of piano-like tones from C2 to C6 without octave errors', () => {
		const misses: string[] = [];
		// The app's exercises use F2..G5; test a wider band.
		for (let midi = 36; midi <= 84; midi++) {
			const f = detectPitch(pianoTone(midiToFrequency(midi), 2400), SR);
			if (f.freq === null || freqToMidi(f.freq) !== midi) misses.push(`${midi}→${f.freq?.toFixed(1)}`);
		}
		expect(misses).toEqual([]);
	});
	it('is accurate to a few cents for a pure tone', () => {
		const freq = 261.63;
		const buf = new Float32Array(FRAME).map((_, i) => 0.3 * Math.sin((2 * Math.PI * freq * i) / SR));
		const f = detectPitch(buf, SR);
		expect(f.clarity).toBeGreaterThan(0.95);
		expect(Math.abs(1200 * Math.log2(f.freq! / freq))).toBeLessThan(5);
	});
	it('reports silence and noise as no pitch', () => {
		expect(detectPitch(new Float32Array(FRAME), SR).freq).toBeNull();
		const rnd = noise(7);
		const hiss = new Float32Array(FRAME).map(() => 0.05 * rnd());
		const f = detectPitch(hiss, SR);
		expect(f.freq === null || f.clarity < 0.8).toBe(true);
	});
});

describe('tuning helpers', () => {
	it('applies a tuning offset', () => {
		const flat = 440 * 2 ** (-40 / 1200); // a piano 40 cents flat
		expect(freqToMidiFloat(flat, -40)).toBeCloseTo(69, 5);
		expect(freqToMidi(midiToFrequency(60) * 2 ** (45 / 1200), 45)).toBe(60);
		expect(median([3, 1, 2])).toBe(2);
		expect(median([4, 1, 2, 3])).toBe(2.5);
	});
});

/** Feed a sequence of tones (with silent gaps) through detector + tracker. */
function play(tracker: NoteTracker, notes: { midi: number; frames: number; gap?: number; amp?: number }[]) {
	const hop = 1024;
	const events: string[] = [];
	let pos = 0;
	for (const n of notes) {
		for (let i = 0; i < n.frames; i++) {
			const frame = detectPitch(pianoTone(midiToFrequency(n.midi), i * hop, FRAME, n.amp ?? 0.3, 1.5, 0.002, pos + i), SR);
			for (const e of tracker.push(frame)) events.push(`${e.type}:${e.midi}`);
		}
		pos += n.frames;
		for (let i = 0; i < (n.gap ?? 0); i++) for (const e of tracker.push({ freq: null, clarity: 0, rms: 0 })) events.push(`${e.type}:${e.midi}`);
	}
	return events;
}

describe('NoteTracker', () => {
	it('reports each strike once, with releases in the gaps', () => {
		const tr = new NoteTracker();
		expect(play(tr, [{ midi: 60, frames: 20, gap: 10 }, { midi: 64, frames: 20, gap: 10 }, { midi: 67, frames: 20, gap: 10 }]))
			.toEqual(['on:60', 'off:60', 'on:64', 'off:64', 'on:67', 'off:67']);
	});
	it('follows legato steps without a gap', () => {
		const tr = new NoteTracker();
		expect(play(tr, [{ midi: 60, frames: 15 }, { midi: 62, frames: 15 }, { midi: 64, frames: 15, gap: 10 }]))
			.toEqual(['on:60', 'off:60', 'on:62', 'off:62', 'on:64', 'off:64']);
	});
	it('reports a re-strike of the same key when the level jumps', () => {
		const tr = new NoteTracker();
		const quiet = play(tr, [{ midi: 60, frames: 15, amp: 0.05 }]);
		const loud = play(tr, [{ midi: 60, frames: 10, amp: 0.4, gap: 10 }]);
		expect([...quiet, ...loud]).toEqual(['on:60', 'off:60', 'on:60', 'off:60']);
	});
	it('ignores an octave flicker of a ringing note without a new strike', () => {
		const tr = new NoteTracker();
		const f = (freq: number) => ({ freq, clarity: 0.95, rms: 0.05 });
		const out = [
			...Array.from({ length: 6 }, () => tr.push(f(midiToFrequency(60)))),
			...Array.from({ length: 8 }, () => tr.push(f(midiToFrequency(72))))
		].flat();
		expect(out).toEqual([{ type: 'on', midi: 60 }]);
		expect(tr.current).toBe(60);
	});
	it('applies calibration transpose and tuning', () => {
		const tr = new NoteTracker({ transpose: 2, tuningCents: 30 });
		const freq = midiToFrequency(62) * 2 ** (30 / 1200);
		const out = [0, 1, 2].flatMap(() => tr.push({ freq, clarity: 0.95, rms: 0.05 }));
		expect(out).toEqual([{ type: 'on', midi: 60 }]);
	});
});
