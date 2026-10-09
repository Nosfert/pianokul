import { isBlackKey } from './notes';

/** Geometry of an on-screen keyboard in "white-key units": white key i spans x = i .. i+1. */
export interface KeyGeom {
	midi: number;
	black: boolean;
	/** Left edge in white-key units. */
	x: number;
	/** Width in white-key units (1 for white keys, BLACK_WIDTH for black keys). */
	w: number;
}

export const BLACK_WIDTH = 0.6;
/** Black-key height as a fraction of the white-key height. */
export const BLACK_HEIGHT = 0.62;

/** Widen a range so it starts and ends on a white key. */
export function snapToWhite(lo: number, hi: number): { lo: number; hi: number } {
	let a = Math.min(lo, hi);
	let b = Math.max(lo, hi);
	while (isBlackKey(a)) a -= 1;
	while (isBlackKey(b)) b += 1;
	return { lo: a, hi: b };
}

export function layoutKeys(lo: number, hi: number): { keys: KeyGeom[]; whiteCount: number } {
	const r = snapToWhite(lo, hi);
	const keys: KeyGeom[] = [];
	let white = 0;
	for (let midi = r.lo; midi <= r.hi; midi++) {
		if (isBlackKey(midi)) keys.push({ midi, black: true, x: white - BLACK_WIDTH / 2, w: BLACK_WIDTH });
		else {
			keys.push({ midi, black: false, x: white, w: 1 });
			white += 1;
		}
	}
	return { keys, whiteCount: white };
}
