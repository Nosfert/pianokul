// Pure music theory helpers - no imports

export type Lang = 'sv' | 'en';
export type SvNaming = 'H' | 'B';
export type Accidental = 'sharp' | 'flat';
export type Clef = 'treble' | 'bass';
export type Hand = 'right' | 'left' | 'both';

export interface NamingOptions {
  lang: Lang;
  svNaming?: SvNaming;
  accidental?: Accidental;
}

// Default options
const DEFAULT_SV_NAMING: SvNaming = 'H';
const DEFAULT_ACCIDENTAL: Accidental = 'sharp';

// Constants
export const MIDI_MIN = 21;
export const MIDI_MAX = 108;
export const MIDDLE_C = 60;

// White keys: C, D, E, F, G, A, B (pitch classes)
export const WHITE_PITCH_CLASSES: readonly number[] = [0, 2, 4, 5, 7, 9, 11];
// Black keys: C#, D#, F#, G#, A# (pitch classes)
export const BLACK_PITCH_CLASSES: readonly number[] = [1, 3, 6, 8, 10];

// Spelling tables by pitch class 0..11
// en sharp: C C# D D# E F F# G G# A A# B
const EN_SHARP: readonly string[] = ['C', 'C\u266f', 'D', 'D\u266f', 'E', 'F', 'F\u266f', 'G', 'G\u266f', 'A', 'A\u266f', 'B'];

// en flat: C Db D Eb E F Gb G Ab A Bb B
const EN_FLAT: readonly string[] = ['C', 'D\u266d', 'D', 'E\u266d', 'E', 'F', 'G\u266d', 'G', 'A\u266d', 'A', 'B\u266d', 'B'];

// sv 'H' sharp: C Ciss D Diss E F Fiss G Giss A Aiss H
const SV_H_SHARP: readonly string[] = ['C', 'Ciss', 'D', 'Diss', 'E', 'F', 'Fiss', 'G', 'Giss', 'A', 'Aiss', 'H'];

// sv 'H' flat: C Dess D Ess E F Gess G Ass A B H
const SV_H_FLAT: readonly string[] = ['C', 'Dess', 'D', 'Ess', 'E', 'F', 'Gess', 'G', 'Ass', 'A', 'B', 'H'];

// sv 'B' sharp: C Ciss D Diss E F Fiss G Giss A Aiss B
const SV_B_SHARP: readonly string[] = ['C', 'Ciss', 'D', 'Diss', 'E', 'F', 'Fiss', 'G', 'Giss', 'A', 'Aiss', 'B'];

// sv 'B' flat: C Dess D Ess E F Gess G Ass A Bess B
const SV_B_FLAT: readonly string[] = ['C', 'Dess', 'D', 'Ess', 'E', 'F', 'Gess', 'G', 'Ass', 'A', 'Bess', 'B'];

// Solfege
export const SOLFEGE: Record<Lang, readonly string[]> = {
  sv: ['do', 're', 'mi', 'fa', 'sol', 'la', 'si'],
  en: ['do', 're', 'mi', 'fa', 'sol', 'la', 'ti'],
};

// Helper: pitch class from MIDI (0..11)
export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

// Helper: octave from MIDI (MIDI 60 = C4 -> octave 4)
export function octave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

// Check if a MIDI note is a white key
export function isWhiteKey(midi: number): boolean {
  return WHITE_PITCH_CLASSES.includes(pitchClass(midi));
}

// Check if a MIDI note is a black key
export function isBlackKey(midi: number): boolean {
  return BLACK_PITCH_CLASSES.includes(pitchClass(midi));
}

// Get letter index (0..6 for C D E F G A B)
// Black keys use the letter below (sharp spelling)
export function letterIndex(midi: number): number {
  const pc = pitchClass(midi);
  // White keys: C=0, D=1, E=2, F=3, G=4, A=5, B=6
  // Black keys: use the letter below
  // 1(C#)->0, 3(D#)->1, 6(F#)->3, 8(G#)->4, 10(A#)->5
  const blackToWhite: Record<number, number> = {
    1: 0, // C#
    3: 1, // D#
    6: 3, // F#
    8: 4, // G#
    10: 5, // A#
  };
  if (BLACK_PITCH_CLASSES.includes(pc)) {
    return blackToWhite[pc];
  }
  // White keys: map pitch class to letter index
  // C=0->0, D=2->1, E=4->2, F=5->3, G=7->4, A=9->5, B=11->6
  const whiteMap: Record<number, number> = {
    0: 0,
    2: 1,
    4: 2,
    5: 3,
    7: 4,
    9: 5,
    11: 6,
  };
  return whiteMap[pc];
}

// Get note name without octave
export function noteName(midi: number, opts: NamingOptions): string {
  const { lang, svNaming = DEFAULT_SV_NAMING, accidental = DEFAULT_ACCIDENTAL } = opts;
  const pc = pitchClass(midi);

  let table: readonly string[];

  if (lang === 'en') {
    table = accidental === 'sharp' ? EN_SHARP : EN_FLAT;
  } else {
    // sv
    if (svNaming === 'H') {
      table = accidental === 'sharp' ? SV_H_SHARP : SV_H_FLAT;
    } else {
      // 'B'
      table = accidental === 'sharp' ? SV_B_SHARP : SV_B_FLAT;
    }
  }

  return table[pc];
}

// Get note name with octave
export function noteNameWithOctave(midi: number, opts: NamingOptions): string {
  const name = noteName(midi, opts);
  const oct = octave(midi);
  return `${name}${oct}`;
}

// Lookup of lower-cased note name -> pitch class, built from ALL six spelling
// tables plus ASCII variants ('#' for \u266f, 'b' for \u266d). The ambiguous
// bare 'b' is left out here and resolved per call in parseNoteName.
const NOTE_NAME_LOOKUP: ReadonlyMap<string, number> = (() => {
  const map = new Map<string, number>();
  for (const table of [EN_SHARP, EN_FLAT, SV_H_SHARP, SV_H_FLAT, SV_B_SHARP, SV_B_FLAT]) {
    table.forEach((name, pc) => {
      const lower = name.toLowerCase();
      map.set(lower, pc);
      map.set(lower.replace('\u266f', '#').replace('\u266d', 'b'), pc);
    });
  }
  map.set('h', 11);
  map.delete('b');
  return map;
})();

// Parse a note name ('C#4', 'Bb3', 'Ciss5', 'Dess2', 'H3', 'B4', 'c') to MIDI.
// Letters are case-insensitive; the octave is optional (defaults to octaveDefault).
// Bare 'B' is B\u266d (10) in Swedish H mode, B (11) in Swedish B mode and English.
// Returns null for unknown names or results outside MIDI_MIN..MIDI_MAX.
export function parseNoteName(
  name: string,
  lang: Lang,
  octaveDefault = 4,
  svNaming: SvNaming = 'H'
): number | null {
  const match = /^(.*?)(-?\d+)?$/.exec(name.trim());
  if (!match) return null;
  const letters = match[1].toLowerCase();
  const pc =
    letters === 'b' ? (lang === 'sv' && svNaming === 'H' ? 10 : 11) : NOTE_NAME_LOOKUP.get(letters);
  if (pc === undefined) return null;

  const oct = match[2] === undefined ? octaveDefault : parseInt(match[2], 10);
  const midi = (oct + 1) * 12 + pc;
  if (!Number.isInteger(midi) || midi < MIDI_MIN || midi > MIDI_MAX) return null;
  return midi;
}

// Get clef for MIDI note
export function clefFor(midi: number): Clef {
  return midi < MIDDLE_C ? 'bass' : 'treble';
}

// Get hand for MIDI note
export function handFor(midi: number): 'right' | 'left' {
  return midi < MIDDLE_C ? 'left' : 'right';
}

// Get all white keys between lo and hi (inclusive)
export function whiteKeysBetween(lo: number, hi: number): number[] {
  const result: number[] = [];
  for (let midi = lo; midi <= hi; midi++) {
    if (isWhiteKey(midi)) {
      result.push(midi);
    }
  }
  return result;
}

// Get all keys (white and black) between lo and hi (inclusive)
export function allKeysBetween(lo: number, hi: number): number[] {
  const result: number[] = [];
  for (let midi = lo; midi <= hi; midi++) {
    result.push(midi);
  }
  return result;
}

// Transpose MIDI note by semitones (clamped to valid range)
export function transpose(midi: number, semitones: number): number {
  const result = midi + semitones;
  if (result < MIDI_MIN) return MIDI_MIN;
  if (result > MIDI_MAX) return MIDI_MAX;
  return result;
}
