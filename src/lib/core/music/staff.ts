import { isBlackKey, letterIndex, octave, type Accidental, type Clef } from './notes';

export interface NotePlacement {
	position: number;
	ledgerLines: number[];
	stem: 'up' | 'down';
	accidental: '♯' | '♭' | null;
}

/** Staff lines, bottom to top, as positions. */
export const STAFF_LINE_POSITIONS: readonly number[] = [0, 2, 4, 6, 8];

/** Diatonic step number: octave * 7 + letter (C=0 … B=6). A flat-spelled black key uses the letter above. */
export function diatonic(midi: number, accidental?: Accidental): number {
	return octave(midi) * 7 + letterIndex(midi) + (accidental === 'flat' && isBlackKey(midi) ? 1 : 0);
}

export function bottomLineDiatonic(clef: Clef): number {
	return clef === 'treble' ? 30 : 18;
}

export function staffPosition(midi: number, clef: Clef, accidental?: Accidental): number {
	return diatonic(midi, accidental) - bottomLineDiatonic(clef);
}

/** Ledger lines needed for a note at `position`, ordered from the staff outwards. */
export function ledgerLines(position: number): number[] {
	const out: number[] = [];
	for (let p = -2; p >= position; p -= 2) out.push(p);
	for (let p = 10; p <= position; p += 2) out.push(p);
	return out;
}

export function stemDirection(position: number): 'up' | 'down' {
	return position >= 4 ? 'down' : 'up';
}

export function placeNote(midi: number, clef: Clef, accidental?: Accidental): NotePlacement {
	const position = staffPosition(midi, clef, accidental);
	return {
		position,
		ledgerLines: ledgerLines(position),
		stem: stemDirection(position),
		accidental: isBlackKey(midi) ? (accidental === 'flat' ? '♭' : '♯') : null
	};
}

/** Which single clef suits a range (the grand staff decides per note with clefFor). */
export function clefForRange(lo: number, hi: number): Clef {
	return hi < 60 ? 'bass' : 'treble';
}

/** y coordinate of a position given the line gap and the y of the bottom line. */
export function positionToY(position: number, lineGap: number, bottomLineY: number): number {
	return bottomLineY - (position * lineGap) / 2;
}
