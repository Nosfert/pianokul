import { describe, expect, it } from 'vitest';
import { Calibrator, CALIBRATION_TARGETS, QUIET_FRAMES } from './calibration';
import { midiToFrequency } from '$lib/audio/synth';

const silence = { freq: null, clarity: 0, rms: 0.001 };
const tone = (midi: number, cents = 0) => ({ freq: midiToFrequency(midi) * 2 ** (cents / 1200), clarity: 0.95, rms: 0.05 });

function strike(c: Calibrator, midi: number, cents = 0, frames = 14) {
	for (let i = 0; i < frames; i++) c.push(tone(midi, cents));
	for (let i = 0; i < 10; i++) c.push(silence);
}

describe('Calibrator', () => {
	it('measures the room, then asks for each key and learns the tuning offset', () => {
		const c = new Calibrator();
		for (let i = 0; i < QUIET_FRAMES; i++) c.push(silence);
		expect(c.phase).toBe('note');
		expect(c.gate).toBeGreaterThanOrEqual(0.003);
		for (const midi of CALIBRATION_TARGETS) {
			expect(c.target).toBe(midi);
			strike(c, midi, -25); // a piano 25 cents flat
			expect(c.feedback?.kind).toBe('ok');
		}
		expect(c.phase).toBe('done');
		expect(c.result().tuningCents).toBe(-25);
	});
	it('says wrong key or wrong octave and keeps asking for the same key', () => {
		const c = new Calibrator();
		for (let i = 0; i < QUIET_FRAMES; i++) c.push(silence);
		strike(c, 62);
		expect(c.feedback).toEqual({ kind: 'wrong', heard: 62 });
		expect(c.target).toBe(60);
		strike(c, 72);
		expect(c.feedback).toEqual({ kind: 'octave', heard: 72 });
		strike(c, 60);
		expect(c.feedback?.kind).toBe('ok');
		expect(c.target).toBe(64);
	});
	it('raises the noise gate in a noisy room', () => {
		const c = new Calibrator();
		for (let i = 0; i < QUIET_FRAMES; i++) c.push({ freq: null, clarity: 0, rms: 0.006 });
		expect(c.gate).toBeCloseTo(0.018, 5);
	});
});
