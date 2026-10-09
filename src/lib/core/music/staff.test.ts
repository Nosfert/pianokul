import { describe, it, expect } from 'vitest';
import {
	STAFF_LINE_POSITIONS,
	diatonic,
	bottomLineDiatonic,
	staffPosition,
	ledgerLines,
	stemDirection,
	placeNote,
	clefForRange,
	positionToY
} from './staff';
import { isWhiteKey } from './notes';

describe('STAFF_LINE_POSITIONS', () => {
	it('lists the five lines bottom to top', () => {
		expect(STAFF_LINE_POSITIONS).toEqual([0, 2, 4, 6, 8]);
	});
});

describe('diatonic', () => {
	it.each([
		[60, 28],
		[59, 27],
		[64, 30],
		[77, 38],
		[43, 18]
	])('diatonic(%i) = %i', (midi, expected) => {
		expect(diatonic(midi)).toBe(expected);
	});

	it('uses the letter above for a flat-spelled black key', () => {
		expect(diatonic(61)).toBe(28);
		expect(diatonic(61, 'sharp')).toBe(28);
		expect(diatonic(61, 'flat')).toBe(29);
	});

	it('ignores flat spelling on white keys', () => {
		expect(diatonic(60, 'flat')).toBe(28);
	});
});

describe('bottomLineDiatonic', () => {
	it('treble bottom line is E4, bass is G2', () => {
		expect(bottomLineDiatonic('treble')).toBe(30);
		expect(bottomLineDiatonic('bass')).toBe(18);
	});
});

describe('staffPosition', () => {
	it.each([
		[64, 0], // E4
		[65, 1], // F4
		[67, 2], // G4
		[71, 4], // B4
		[77, 8], // F5
		[60, -2], // C4
		[62, -1], // D4
		[79, 9], // G5
		[81, 10] // A5
	])('treble: %i -> %i', (midi, expected) => {
		expect(staffPosition(midi, 'treble')).toBe(expected);
	});

	it.each([
		[43, 0], // G2
		[48, 3], // C3
		[53, 6], // F3
		[57, 8], // A3
		[60, 10], // C4
		[40, -2] // E2
	])('bass: %i -> %i', (midi, expected) => {
		expect(staffPosition(midi, 'bass')).toBe(expected);
	});

	it('white keys 60..84 on treble give positions -2..12 in order', () => {
		const positions: number[] = [];
		for (let m = 60; m <= 84; m++) if (isWhiteKey(m)) positions.push(staffPosition(m, 'treble'));
		expect(positions).toEqual(Array.from({ length: 15 }, (_, i) => i - 2));
	});

	it('white keys 36..60 on bass give positions -4..10 in order', () => {
		const positions: number[] = [];
		for (let m = 36; m <= 60; m++) if (isWhiteKey(m)) positions.push(staffPosition(m, 'bass'));
		expect(positions).toEqual(Array.from({ length: 15 }, (_, i) => i - 4));
	});
});

describe('ledgerLines', () => {
	it('below the staff', () => {
		expect(ledgerLines(-2)).toEqual([-2]);
		expect(ledgerLines(-3)).toEqual([-2]);
		expect(ledgerLines(-4)).toEqual([-2, -4]);
	});

	it('above the staff', () => {
		expect(ledgerLines(10)).toEqual([10]);
		expect(ledgerLines(11)).toEqual([10]);
		expect(ledgerLines(12)).toEqual([10, 12]);
	});

	it('none for positions -1..9', () => {
		for (let p = -1; p <= 9; p++) expect(ledgerLines(p)).toEqual([]);
	});
});

describe('stemDirection', () => {
	it('down from the middle line up, otherwise up', () => {
		expect(stemDirection(3)).toBe('up');
		expect(stemDirection(4)).toBe('down');
		expect(stemDirection(-2)).toBe('up');
		expect(stemDirection(10)).toBe('down');
	});
});

describe('placeNote', () => {
	it('C4 on treble', () => {
		expect(placeNote(60, 'treble')).toEqual({
			position: -2,
			ledgerLines: [-2],
			stem: 'up',
			accidental: null
		});
	});

	it('C#4 on treble (sharp by default)', () => {
		const p = placeNote(61, 'treble');
		expect(p.accidental).toBe('♯');
		expect(p.position).toBe(-2);
	});

	it('Db4 on treble', () => {
		expect(placeNote(61, 'treble', 'flat')).toEqual({
			position: -1,
			ledgerLines: [],
			stem: 'up',
			accidental: '♭'
		});
	});

	it('B4 on treble has a down stem', () => {
		const p = placeNote(71, 'treble');
		expect(p.position).toBe(4);
		expect(p.stem).toBe('down');
	});

	it('C4 on bass', () => {
		expect(placeNote(60, 'bass')).toEqual({
			position: 10,
			ledgerLines: [10],
			stem: 'down',
			accidental: null
		});
	});

	it('G2 on bass', () => {
		const p = placeNote(43, 'bass');
		expect(p.position).toBe(0);
		expect(p.stem).toBe('up');
	});
});

describe('positionToY', () => {
	it('maps positions to y coordinates', () => {
		expect(positionToY(0, 10, 100)).toBe(100);
		expect(positionToY(8, 10, 100)).toBe(60);
		expect(positionToY(-2, 10, 100)).toBe(110);
	});
});

describe('clefForRange', () => {
	it('bass when the range stays below middle C, else treble', () => {
		expect(clefForRange(48, 59)).toBe('bass');
		expect(clefForRange(55, 67)).toBe('treble');
	});
});
