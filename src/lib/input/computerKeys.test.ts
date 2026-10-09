import { describe, it, expect } from 'vitest';
import {
	KEY_TO_SEMITONE,
	OCTAVE_DOWN_CODE,
	OCTAVE_UP_CODE,
	BASE_MIN,
	BASE_MAX,
	DEFAULT_BASE,
	midiForCode,
	codeForMidi,
	keyLabelForCode,
	actionForKey,
	clampBase,
	shiftBase,
	computerLabels
} from './computerKeys';

describe('KEY_TO_SEMITONE', () => {
	it('maps all 17 codes to correct semitones at base 60', () => {
		expect(midiForCode('KeyA', 60)).toBe(60);
		expect(midiForCode('KeyW', 60)).toBe(61);
		expect(midiForCode('KeyS', 60)).toBe(62);
		expect(midiForCode('KeyE', 60)).toBe(63);
		expect(midiForCode('KeyD', 60)).toBe(64);
		expect(midiForCode('KeyF', 60)).toBe(65);
		expect(midiForCode('KeyT', 60)).toBe(66);
		expect(midiForCode('KeyG', 60)).toBe(67);
		expect(midiForCode('KeyY', 60)).toBe(68);
		expect(midiForCode('KeyH', 60)).toBe(69);
		expect(midiForCode('KeyU', 60)).toBe(70);
		expect(midiForCode('KeyJ', 60)).toBe(71);
		expect(midiForCode('KeyK', 60)).toBe(72);
		expect(midiForCode('KeyO', 60)).toBe(73);
		expect(midiForCode('KeyL', 60)).toBe(74);
		expect(midiForCode('KeyP', 60)).toBe(75);
		expect(midiForCode('Semicolon', 60)).toBe(76);
	});

	it('returns null for unmapped codes', () => {
		expect(midiForCode('KeyQ', 60)).toBeNull();
		expect(midiForCode('KeyZ', 60)).toBeNull();
		expect(midiForCode('KeyX', 60)).toBeNull();
		expect(midiForCode('ArrowUp', 60)).toBeNull();
	});
});

describe('midiForCode with different bases', () => {
	it('works at base 48', () => {
		expect(midiForCode('KeyA', 48)).toBe(48);
		expect(midiForCode('KeyW', 48)).toBe(49);
		expect(midiForCode('Semicolon', 48)).toBe(64);
	});
});

describe('codeForMidi', () => {
	it('round-trips every code at base 60', () => {
		for (const [code, semi] of Object.entries(KEY_TO_SEMITONE)) {
			expect(codeForMidi(60 + semi, 60)).toBe(code);
		}
	});

	it('returns null when midi is not in the mapping', () => {
		expect(codeForMidi(59, 60)).toBeNull();
		expect(codeForMidi(100, 60)).toBeNull();
	});
});

describe('keyLabelForCode', () => {
	it('extracts single letter for KeyX codes', () => {
		expect(keyLabelForCode('KeyA')).toBe('A');
		expect(keyLabelForCode('KeyW')).toBe('W');
		expect(keyLabelForCode('KeyS')).toBe('S');
	});

	it('handles Semicolon', () => {
		expect(keyLabelForCode('Semicolon')).toBe(';');
	});

	it('returns empty string for unknown codes', () => {
		expect(keyLabelForCode('ArrowUp')).toBe('');
		expect(keyLabelForCode('Enter')).toBe('');
	});
});

describe('actionForKey', () => {
	it('returns note action for mapped key', () => {
		expect(actionForKey({ code: 'KeyA' }, 60)).toEqual({ type: 'note', midi: 60 });
		expect(actionForKey({ code: 'KeyW' }, 60)).toEqual({ type: 'note', midi: 61 });
	});

	it('returns null when ctrlKey is true', () => {
		expect(actionForKey({ code: 'KeyA', ctrlKey: true }, 60)).toBeNull();
	});

	it('returns null when metaKey is true', () => {
		expect(actionForKey({ code: 'KeyA', metaKey: true }, 60)).toBeNull();
	});

	it('returns null when altKey is true', () => {
		expect(actionForKey({ code: 'KeyA', altKey: true }, 60)).toBeNull();
	});

	it('returns null when repeat is true', () => {
		expect(actionForKey({ code: 'KeyA', repeat: true }, 60)).toBeNull();
	});

	it('returns null when inTextField is true', () => {
		expect(actionForKey({ code: 'KeyA' }, 60, true)).toBeNull();
	});

	it('returns octave down for KeyZ', () => {
		expect(actionForKey({ code: 'KeyZ' }, 60)).toEqual({ type: 'octave', delta: -1 });
	});

	it('returns octave up for KeyX', () => {
		expect(actionForKey({ code: 'KeyX' }, 60)).toEqual({ type: 'octave', delta: 1 });
	});

	it('returns null for unmapped keys', () => {
		expect(actionForKey({ code: 'KeyQ' }, 60)).toBeNull();
	});
});

describe('clampBase', () => {
	it('returns same value if already multiple of 12', () => {
		expect(clampBase(60)).toBe(60);
		expect(clampBase(24)).toBe(24);
		expect(clampBase(84)).toBe(84);
	});

	it('rounds to nearest multiple of 12', () => {
		expect(clampBase(61)).toBe(60);
		expect(clampBase(66)).toBe(72);
	});

	it('clamps to range bounds', () => {
		expect(clampBase(90)).toBe(84);
		expect(clampBase(10)).toBe(24);
		expect(clampBase(0)).toBe(24);
		expect(clampBase(100)).toBe(84);
	});
});

describe('shiftBase', () => {
	it('shifts by ±12', () => {
		expect(shiftBase(60, 1)).toBe(72);
		expect(shiftBase(60, -1)).toBe(48);
	});

	it('clamps to range bounds', () => {
		expect(shiftBase(84, 1)).toBe(84);
		expect(shiftBase(24, -1)).toBe(24);
	});
});

describe('computerLabels', () => {
	it('produces correct labels at base 60', () => {
		const labels = computerLabels(60);
		expect(labels[60]).toBe('A');
		expect(labels[76]).toBe(';');
		expect(labels[61]).toBe('W');
		expect(labels[72]).toBe('K');
	});

	it('ensures all mids are within 21..108 for min and max bases', () => {
		const minLabels = computerLabels(24);
		const maxLabels = computerLabels(84);

		for (const midi in minLabels) {
			expect(Number(midi)).toBeGreaterThanOrEqual(21);
			expect(Number(midi)).toBeLessThanOrEqual(108);
		}

		for (const midi in maxLabels) {
			expect(Number(midi)).toBeGreaterThanOrEqual(21);
			expect(Number(midi)).toBeLessThanOrEqual(108);
		}
	});
});
