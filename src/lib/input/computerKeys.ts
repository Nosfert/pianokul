/** Physical key code → semitone offset from the base C. One octave + a fifth, like most DAWs. */
export const KEY_TO_SEMITONE: Readonly<Record<string, number>> = {
	KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11,
	KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16
};
export const OCTAVE_DOWN_CODE = 'KeyZ';
export const OCTAVE_UP_CODE = 'KeyX';
export const BASE_MIN = 24;
export const BASE_MAX = 84;
export const DEFAULT_BASE = 60;

export interface KeyLike {
	code: string;
	ctrlKey?: boolean;
	metaKey?: boolean;
	altKey?: boolean;
	repeat?: boolean;
}
export type KeyAction = { type: 'note'; midi: number } | { type: 'octave'; delta: -1 | 1 } | null;

/** Nearest multiple of 12 within [BASE_MIN, BASE_MAX]. */
export function clampBase(base: number): number {
	const rounded = Math.round(base / 12) * 12;
	return Math.min(BASE_MAX, Math.max(BASE_MIN, rounded));
}

export function midiForCode(code: string, base: number): number | null {
	const semi = KEY_TO_SEMITONE[code];
	return semi === undefined ? null : base + semi;
}

export function codeForMidi(midi: number, base: number): string | null {
	const semi = midi - base;
	for (const [code, s] of Object.entries(KEY_TO_SEMITONE)) if (s === semi) return code;
	return null;
}

/** Short label for a key code, for on-key hints: 'KeyA' → 'A', 'Semicolon' → ';'. */
export function keyLabelForCode(code: string): string {
	if (code.startsWith('Key') && code.length === 4) return code.slice(3);
	if (code === 'Semicolon') return ';';
	return '';
}

export function actionForKey(e: KeyLike, base: number, inTextField = false): KeyAction {
	if (inTextField || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return null;
	if (e.code === OCTAVE_DOWN_CODE) return { type: 'octave', delta: -1 };
	if (e.code === OCTAVE_UP_CODE) return { type: 'octave', delta: 1 };
	const midi = midiForCode(e.code, base);
	return midi === null ? null : { type: 'note', midi };
}

export function shiftBase(base: number, delta: -1 | 1): number {
	return clampBase(base + delta * 12);
}

/** Labels for every key the computer keyboard can play at this base (midi → letter). */
export function computerLabels(base: number): Record<number, string> {
	const out: Record<number, string> = {};
	for (const [code, semi] of Object.entries(KEY_TO_SEMITONE)) out[base + semi] = keyLabelForCode(code);
	return out;
}
