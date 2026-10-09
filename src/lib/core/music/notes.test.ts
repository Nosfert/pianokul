import { describe, it, expect } from 'vitest';
import {
  pitchClass,
  octave,
  isWhiteKey,
  isBlackKey,
  letterIndex,
  noteName,
  noteNameWithOctave,
  parseNoteName,
  clefFor,
  handFor,
  whiteKeysBetween,
  allKeysBetween,
  transpose,
  MIDI_MIN,
  MIDI_MAX,
  MIDDLE_C,
  WHITE_PITCH_CLASSES,
  BLACK_PITCH_CLASSES,
  type NamingOptions,
} from './notes';

describe('pitchClass', () => {
  it('returns 0 for C4 (MIDI 60)', () => {
    expect(pitchClass(60)).toBe(0);
  });

  it('returns 11 for B4 (MIDI 71)', () => {
    expect(pitchClass(71)).toBe(11);
  });

  it('returns correct pitch class for various notes', () => {
    expect(pitchClass(69)).toBe(9); // A4
    expect(pitchClass(60)).toBe(0); // C4
    expect(pitchClass(72)).toBe(0); // C5
  });

  it('handles edge cases (MIDI_MIN and MIDI_MAX)', () => {
    // A0 = MIDI 21, pitch class 9 (A = 9 in 0..11)
    expect(pitchClass(MIDI_MIN)).toBe(9);
    // 21 % 12 = 9
    expect(21 % 12).toBe(9);
  });
});

describe('octave', () => {
  it('returns 4 for C4 (MIDI 60)', () => {
    expect(octave(60)).toBe(4);
  });

  it('returns 3 for B3 (MIDI 59)', () => {
    expect(octave(59)).toBe(3);
  });

  it('returns 0 for A0 (MIDI 21)', () => {
    expect(octave(21)).toBe(0);
  });

  it('returns 8 for C8 (MIDI 108)', () => {
    expect(octave(108)).toBe(8);
  });
});

describe('isWhiteKey / isBlackKey', () => {
  it('C4 (60) is white key', () => {
    expect(isWhiteKey(60)).toBe(true);
    expect(isBlackKey(60)).toBe(false);
  });

  it('C#4 (61) is black key', () => {
    expect(isWhiteKey(61)).toBe(false);
    expect(isBlackKey(61)).toBe(true);
  });

  it('white keys: 0,2,4,5,7,9,11 pitch classes', () => {
    for (const pc of WHITE_PITCH_CLASSES) {
      expect(isWhiteKey(pc)).toBe(true);
    }
  });

  it('black keys: 1,3,6,8,10 pitch classes', () => {
    for (const pc of BLACK_PITCH_CLASSES) {
      expect(isBlackKey(pc)).toBe(true);
    }
  });

  it('has exactly 7 white and 5 black pitch classes', () => {
    expect(WHITE_PITCH_CLASSES).toHaveLength(7);
    expect(BLACK_PITCH_CLASSES).toHaveLength(5);
    const pcs = Array.from({ length: 12 }, (_, pc) => pc);
    expect(pcs.filter((pc) => isWhiteKey(pc))).toHaveLength(7);
    expect(pcs.filter((pc) => isBlackKey(pc))).toHaveLength(5);
  });
});

describe('letterIndex', () => {
  it('returns correct index for white keys', () => {
    expect(letterIndex(60)).toBe(0); // C
    expect(letterIndex(62)).toBe(1); // D
    expect(letterIndex(64)).toBe(2); // E
    expect(letterIndex(65)).toBe(3); // F
    expect(letterIndex(67)).toBe(4); // G
    expect(letterIndex(69)).toBe(5); // A
    expect(letterIndex(71)).toBe(6); // B
  });

  it('returns correct index for black keys (sharp spelling)', () => {
    expect(letterIndex(61)).toBe(0); // C#
    expect(letterIndex(63)).toBe(1); // D#
    expect(letterIndex(66)).toBe(3); // F#
    expect(letterIndex(68)).toBe(4); // G#
    expect(letterIndex(70)).toBe(5); // A#
  });
});

describe('noteName', () => {
  it('returns C for MIDI 60 in English sharp', () => {
    expect(noteName(60, { lang: 'en', accidental: 'sharp' })).toBe('C');
  });

  it('returns C# for MIDI 61 in English sharp', () => {
    expect(noteName(61, { lang: 'en' as const, accidental: 'sharp' as const })).toBe('C\u266f');
  });

  it('returns D\u266d for MIDI 61 in English flat', () => {
    expect(noteName(61, { lang: 'en' as const, accidental: 'flat' as const })).toBe('D\u266d');
  });

  it('returns H for MIDI 71 in Swedish H mode', () => {
    expect(noteName(71, { lang: 'sv' as const, svNaming: 'H' as const, accidental: 'sharp' as const })).toBe('H');
  });

  it('returns B for MIDI 71 in Swedish B mode', () => {
    expect(noteName(71, { lang: 'sv' as const, svNaming: 'B' as const, accidental: 'sharp' as const })).toBe('B');
  });

  it('returns B for MIDI 70 in Swedish H mode flat', () => {
    expect(noteName(70, { lang: 'sv' as const, svNaming: 'H' as const, accidental: 'flat' as const })).toBe('B');
  });

  it('returns Aiss for MIDI 70 in Swedish H mode sharp', () => {
    expect(noteName(70, { lang: 'sv' as const, svNaming: 'H' as const, accidental: 'sharp' as const })).toBe('Aiss');
  });

  it('returns Bess for MIDI 70 in Swedish B mode flat', () => {
    expect(noteName(70, { lang: 'sv' as const, svNaming: 'B' as const, accidental: 'flat' as const })).toBe('Bess');
  });

  it('defaults svNaming to H', () => {
    expect(noteName(71, { lang: 'sv' as const })).toBe('H');
  });

  it('defaults accidental to sharp', () => {
    expect(noteName(61, { lang: 'en' as const })).toBe('C\u266f');
  });

  const tables: Array<[NamingOptions, string[]]> = [
    [{ lang: 'en', accidental: 'sharp' }, ['C', 'C\u266f', 'D', 'D\u266f', 'E', 'F', 'F\u266f', 'G', 'G\u266f', 'A', 'A\u266f', 'B']],
    [{ lang: 'en', accidental: 'flat' }, ['C', 'D\u266d', 'D', 'E\u266d', 'E', 'F', 'G\u266d', 'G', 'A\u266d', 'A', 'B\u266d', 'B']],
    [{ lang: 'sv', svNaming: 'H', accidental: 'sharp' }, ['C', 'Ciss', 'D', 'Diss', 'E', 'F', 'Fiss', 'G', 'Giss', 'A', 'Aiss', 'H']],
    [{ lang: 'sv', svNaming: 'H', accidental: 'flat' }, ['C', 'Dess', 'D', 'Ess', 'E', 'F', 'Gess', 'G', 'Ass', 'A', 'B', 'H']],
    [{ lang: 'sv', svNaming: 'B', accidental: 'sharp' }, ['C', 'Ciss', 'D', 'Diss', 'E', 'F', 'Fiss', 'G', 'Giss', 'A', 'Aiss', 'B']],
    [{ lang: 'sv', svNaming: 'B', accidental: 'flat' }, ['C', 'Dess', 'D', 'Ess', 'E', 'F', 'Gess', 'G', 'Ass', 'A', 'Bess', 'B']],
  ];

  it.each(tables)('names all 12 pitch classes for %o', (opts, expected) => {
    const names = Array.from({ length: 12 }, (_, pc) => noteName(60 + pc, opts));
    expect(names).toEqual(expected);
  });
});

describe('noteNameWithOctave', () => {
  it('returns C4 for MIDI 60', () => {
    expect(noteNameWithOctave(60, { lang: 'en' })).toBe('C4');
  });

  it('returns C\u266f4 for MIDI 61', () => {
    expect(noteNameWithOctave(61, { lang: 'en' })).toBe('C\u266f4');
  });

  it('returns H3 for MIDI 59 in Swedish H mode', () => {
    expect(noteNameWithOctave(59, { lang: 'sv', svNaming: 'H' })).toBe('H3');
  });

  it('returns B3 for MIDI 59 in Swedish B mode', () => {
    expect(noteNameWithOctave(59, { lang: 'sv', svNaming: 'B' })).toBe('B3');
  });
});

describe('parseNoteName', () => {
  it('parses C#4 to MIDI 61', () => {
    expect(parseNoteName('C#4', 'en')).toBe(61);
  });

  it('parses Bb3 to MIDI 58', () => {
    expect(parseNoteName('Bb3', 'en')).toBe(58);
  });

  it('parses h to MIDI 71 in Swedish H mode', () => {
    expect(parseNoteName('h', 'sv', 4, 'H')).toBe(71);
  });

  it('parses b to MIDI 70 in Swedish H mode', () => {
    expect(parseNoteName('b', 'sv', 4, 'H')).toBe(70);
  });

  it('parses b to MIDI 71 in Swedish B mode', () => {
    expect(parseNoteName('b', 'sv', 4, 'B')).toBe(71);
  });

  it('resolves bare h/b with default arguments', () => {
    expect(parseNoteName('h', 'sv')).toBe(71);
    expect(parseNoteName('b', 'sv')).toBe(70);
    expect(parseNoteName('b', 'en')).toBe(71);
  });

  it('parses c to MIDI 48 in octave 3', () => {
    expect(parseNoteName('c', 'en', 3)).toBe(48);
  });

  it('returns null for invalid note name', () => {
    expect(parseNoteName('xyz', 'en')).toBeNull();
  });

  it('returns null for out of range note C9', () => {
    expect(parseNoteName('C9', 'en')).toBeNull();
  });

  it('round-trips noteNameWithOctave for all MIDI values in English', () => {
    for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
      const optsSharp = { lang: 'en' as const, accidental: 'sharp' as const };
      const optsFlat = { lang: 'en' as const, accidental: 'flat' as const };

      const nameSharp = noteNameWithOctave(midi, optsSharp);
      const parsedSharp = parseNoteName(nameSharp, 'en' as const);
      expect(parsedSharp).toBe(midi);

      const nameFlat = noteNameWithOctave(midi, optsFlat);
      const parsedFlat = parseNoteName(nameFlat, 'en' as const);
      expect(parsedFlat).toBe(midi);
    }
  });

  it('round-trips noteNameWithOctave for Swedish H mode', () => {
    for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
      const optsSharp = { lang: 'sv' as const, svNaming: 'H' as const, accidental: 'sharp' as const };
      const optsFlat = { lang: 'sv' as const, svNaming: 'H' as const, accidental: 'flat' as const };

      const nameSharp = noteNameWithOctave(midi, optsSharp);
      const parsedSharp = parseNoteName(nameSharp, 'sv' as const, 4, 'H' as const);
      expect(parsedSharp).toBe(midi);

      const nameFlat = noteNameWithOctave(midi, optsFlat);
      const parsedFlat = parseNoteName(nameFlat, 'sv' as const, 4, 'H' as const);
      expect(parsedFlat).toBe(midi);
    }
  });

  it('round-trips noteNameWithOctave for Swedish B mode', () => {
    for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
      const optsSharp = { lang: 'sv' as const, svNaming: 'B' as const, accidental: 'sharp' as const };
      const optsFlat = { lang: 'sv' as const, svNaming: 'B' as const, accidental: 'flat' as const };

      const nameSharp = noteNameWithOctave(midi, optsSharp);
      const parsedSharp = parseNoteName(nameSharp, 'sv' as const, 4, 'B' as const);
      expect(parsedSharp).toBe(midi);

      const nameFlat = noteNameWithOctave(midi, optsFlat);
      const parsedFlat = parseNoteName(nameFlat, 'sv' as const, 4, 'B' as const);
      expect(parsedFlat).toBe(midi);
    }
  });

  it('handles case insensitivity', () => {
    expect(parseNoteName('c#4', 'en')).toBe(61);
    expect(parseNoteName('C#4', 'en')).toBe(61);
    expect(parseNoteName('C#4', 'en')).toBe(61);
  });

  it('parses ASCII # and b symbols', () => {
    expect(parseNoteName('C#4', 'en')).toBe(61);
    expect(parseNoteName('Db4', 'en')).toBe(61);
    expect(parseNoteName('Bb3', 'en')).toBe(58);
    expect(parseNoteName('A#3', 'en')).toBe(58);
  });

  it('parses Unicode accidentals and Swedish names case-insensitively', () => {
    expect(parseNoteName('C\u266f4', 'en')).toBe(61);
    expect(parseNoteName('B\u266d3', 'en')).toBe(58);
    expect(parseNoteName('Ciss5', 'sv')).toBe(73);
    expect(parseNoteName('CISS5', 'sv')).toBe(73);
    expect(parseNoteName('Dess2', 'sv')).toBe(37);
    expect(parseNoteName('H3', 'sv')).toBe(59);
    expect(parseNoteName('B4', 'sv', 4, 'H')).toBe(70);
    expect(parseNoteName('B4', 'sv', 4, 'B')).toBe(71);
    expect(parseNoteName('B4', 'en')).toBe(71);
    expect(parseNoteName('  Ess  ', 'sv')).toBe(63);
  });

  it('accepts names from either Swedish convention', () => {
    expect(parseNoteName('Bess4', 'sv', 4, 'H')).toBe(70);
    expect(parseNoteName('H4', 'sv', 4, 'B')).toBe(71);
  });

  it('uses octaveDefault when no octave is given', () => {
    expect(parseNoteName('Ciss', 'sv', 2)).toBe(37);
    expect(parseNoteName('A', 'en', 0)).toBe(21);
  });

  it('returns null for junk and out-of-range input', () => {
    expect(parseNoteName('', 'en')).toBeNull();
    expect(parseNoteName('   ', 'en')).toBeNull();
    expect(parseNoteName('4', 'en')).toBeNull();
    expect(parseNoteName('C#', 'en', 9)).toBeNull();
    expect(parseNoteName('G#0', 'en')).toBeNull();
    expect(parseNoteName('A0', 'en')).toBe(21);
    expect(parseNoteName('C8', 'en')).toBe(108);
    expect(parseNoteName('C#8', 'en')).toBeNull();
    expect(parseNoteName('C-1', 'en')).toBeNull();
    expect(parseNoteName('C 4', 'en')).toBeNull();
    expect(parseNoteName('Cx4', 'en')).toBeNull();
  });
});

describe('clefFor', () => {
  it('returns bass for MIDI < 60', () => {
    expect(clefFor(59)).toBe('bass');
  });

  it('returns treble for MIDI >= 60', () => {
    expect(clefFor(60)).toBe('treble');
  });
});

describe('handFor', () => {
  it('returns left for MIDI < 60', () => {
    expect(handFor(59)).toBe('left');
  });

  it('returns right for MIDI >= 60', () => {
    expect(handFor(60)).toBe('right');
  });
});

describe('whiteKeysBetween', () => {
  it('returns white keys from C4 to C5', () => {
    expect(whiteKeysBetween(60, 72)).toEqual([60, 62, 64, 65, 67, 69, 71, 72]);
  });

  it('handles edge cases', () => {
    expect(whiteKeysBetween(60, 60)).toEqual([60]);
    expect(whiteKeysBetween(60, 61)).toEqual([60]);
  });
});

describe('allKeysBetween', () => {
  it('returns all keys from C4 to C#5', () => {
    expect(allKeysBetween(60, 63)).toEqual([60, 61, 62, 63]);
  });
});

describe('transpose', () => {
  it('transposes up by 12 semitones', () => {
    expect(transpose(60, 12)).toBe(72);
  });

  it('clamps to MIDI_MAX', () => {
    expect(transpose(108, 5)).toBe(108);
  });

  it('clamps to MIDI_MIN', () => {
    expect(transpose(21, -1)).toBe(21);
  });
});
