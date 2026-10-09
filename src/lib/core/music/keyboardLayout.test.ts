import { describe, expect, it } from 'vitest';
import { BLACK_WIDTH, layoutKeys, snapToWhite } from './keyboardLayout';

describe('snapToWhite', () => {
	it('widens a range that starts or ends on a black key', () => {
		expect(snapToWhite(61, 70)).toEqual({ lo: 60, hi: 71 });
	});

	it('leaves a white-to-white range unchanged', () => {
		expect(snapToWhite(60, 72)).toEqual({ lo: 60, hi: 72 });
	});

	it('orders reversed bounds', () => {
		expect(snapToWhite(72, 60)).toEqual({ lo: 60, hi: 72 });
	});
});

describe('layoutKeys', () => {
	it('lays out one octave C4..C5', () => {
		const { keys, whiteCount } = layoutKeys(60, 72);
		expect(keys).toHaveLength(13);
		expect(whiteCount).toBe(8);

		const whites = keys.filter((k) => !k.black);
		expect(whites.map((k) => k.x)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
		for (const k of whites) expect(k.w).toBe(1);

		const byMidi = (m: number) => keys.find((k) => k.midi === m)!;
		const k61 = byMidi(61);
		expect(k61.black).toBe(true);
		expect(k61.w).toBe(0.6);
		expect(k61.w).toBe(BLACK_WIDTH);
		expect(k61.x).toBeCloseTo(0.7);
		expect(byMidi(63).x).toBeCloseTo(1.7);
		expect(byMidi(66).x).toBeCloseTo(3.7);

		const k72 = byMidi(72);
		expect(k72).toMatchObject({ x: 7, w: 1, black: false });
	});

	it('counts 15 white keys for C3..C5', () => {
		expect(layoutKeys(48, 72).whiteCount).toBe(15);
	});

	it('produces unique, strictly ascending midi numbers', () => {
		for (const [lo, hi] of [
			[60, 72],
			[48, 72],
			[61, 70],
			[21, 108]
		]) {
			const midis = layoutKeys(lo, hi).keys.map((k) => k.midi);
			expect(new Set(midis).size).toBe(midis.length);
			for (let i = 1; i < midis.length; i++) expect(midis[i]).toBe(midis[i - 1]! + 1);
		}
	});
});
