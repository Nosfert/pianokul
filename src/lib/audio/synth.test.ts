import { describe, expect, it } from 'vitest';
import { getSynth, midiToFrequency, resetSynthForTests } from './synth';

describe('synth', () => {
	it('midiToFrequency', () => {
		expect(midiToFrequency(69)).toBe(440);
		expect(midiToFrequency(60)).toBeCloseTo(261.63, 1);
		expect(midiToFrequency(81)).toBe(880);
	});
	it('falls back to a no-op synth without AudioContext', async () => {
		resetSynthForTests();
		const s = getSynth();
		expect(s.ready).toBe(false);
		s.noteOn(60);
		s.noteOff(60);
		s.allOff();
		await s.resume();
		expect(getSynth()).toBe(s);
	});
});
