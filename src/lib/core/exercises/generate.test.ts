import { describe, it, expect } from 'vitest';
import { clefFor, isBlackKey, pitchClass } from '../music/notes';
import {
	checkStep,
	generateMixedRound,
	generateRound,
	isAnswerCorrect,
	keyboardRange,
	melodyLength,
	poolFor
} from './generate';
import { EXERCISE_KINDS, HANDS, LEVELS, parseSkillId, skillId, type Exercise, type SkillRef } from './types';

const ALL_REFS: SkillRef[] = EXERCISE_KINDS.flatMap((kind) =>
	HANDS.flatMap((hand) => LEVELS.map((level) => ({ kind, hand, level })))
);
const SEEDS = [1, 2, 3, 4, 5];

function ex(partial: Partial<Exercise> & Pick<Exercise, 'kind' | 'targets'>): Exercise {
	return {
		id: 'x#0',
		skill: { kind: partial.kind, hand: 'right', level: 1 },
		clef: 'treble',
		octaveMatters: true,
		range: { lo: 60, hi: 71 },
		...partial
	};
}

describe('generateRound invariants', () => {
	it('covers 48 skills', () => {
		expect(ALL_REFS).toHaveLength(48);
	});

	for (const ref of ALL_REFS) {
		it(skillId(ref), () => {
			const pool = poolFor(ref.hand, ref.level);
			let blackSeen = false;
			for (const seed of SEEDS) {
				const round = generateRound(ref, seed);
				expect(round).toHaveLength(10);
				round.forEach((e, i) => {
					expect(e.id).toBe(`${skillId(ref)}#${i}`);
					expect(e.skill).toEqual(ref);
					expect(e.kind).toBe(ref.kind);
					for (const t of e.targets) {
						expect(pool).toContain(t);
						if (isBlackKey(t)) blackSeen = true;
						if (ref.level !== 4) expect(isBlackKey(t)).toBe(false);
					}
					if (ref.kind === 'name-key') {
						expect(e.choices).toHaveLength(4);
						expect(new Set(e.choices!.map(pitchClass)).size).toBe(4);
						expect(e.choices).toContain(e.targets[0]);
					} else {
						expect(e.choices).toBeUndefined();
					}
					if (ref.kind === 'play-melody') {
						expect(e.targets).toHaveLength(melodyLength(ref.level));
						for (let k = 1; k < e.targets.length; k++) {
							expect(e.targets[k]).not.toBe(e.targets[k - 1]);
							if (ref.level <= 2) {
								const d = Math.abs(pool.indexOf(e.targets[k]!) - pool.indexOf(e.targets[k - 1]!));
								expect(d).toBeLessThanOrEqual(4);
							}
						}
					} else {
						expect(e.targets).toHaveLength(1);
					}
					if (i > 0) expect(e.targets[0]).not.toBe(round[i - 1]!.targets[0]);
					expect(e.clef).toBe(clefFor(e.targets[0]!));
					expect(e.range).toEqual(keyboardRange(ref.hand, ref.level));
					expect(e.octaveMatters).toBe(ref.kind !== 'find-key' || ref.level !== 1);
				});
			}
			if (ref.level === 4) expect(blackSeen).toBe(true);
		});
	}
});

describe('determinism', () => {
	it('same seed gives deep-equal rounds', () => {
		for (const ref of ALL_REFS) {
			expect(generateRound(ref, 42)).toEqual(generateRound(ref, 42));
		}
	});

	it('different seeds differ for read-note/right/2', () => {
		const ref: SkillRef = { kind: 'read-note', hand: 'right', level: 2 };
		expect(generateRound(ref, 1)).not.toEqual(generateRound(ref, 2));
	});
});

describe('keyboardRange', () => {
	it.each([
		['right', 1, { lo: 60, hi: 71 }],
		['right', 2, { lo: 60, hi: 72 }],
		['left', 2, { lo: 48, hi: 60 }],
		['right', 3, { lo: 48, hi: 83 }],
		['left', 3, { lo: 36, hi: 71 }],
		['both', 1, { lo: 48, hi: 71 }]
	] as const)('%s/%i', (hand, level, expected) => {
		expect(keyboardRange(hand, level)).toEqual(expected);
	});
});

describe('melodyLength', () => {
	it('is 3, 4, 5, 5', () => {
		expect(LEVELS.map(melodyLength)).toEqual([3, 4, 5, 5]);
	});
});

describe('isAnswerCorrect', () => {
	it('name-key matches pitch class', () => {
		const e = ex({ kind: 'name-key', targets: [60], choices: [60, 62, 64, 65] });
		expect(isAnswerCorrect(e, 72)).toBe(true);
		expect(isAnswerCorrect(e, 62)).toBe(false);
	});

	it('find-key level 1 accepts any octave', () => {
		const e = ex({ kind: 'find-key', targets: [60], octaveMatters: false });
		expect(isAnswerCorrect(e, 72)).toBe(true);
	});

	it('find-key level 2 needs the exact key', () => {
		const e = ex({ kind: 'find-key', targets: [60], octaveMatters: true });
		expect(isAnswerCorrect(e, 72)).toBe(false);
		expect(isAnswerCorrect(e, 60)).toBe(true);
	});

	it('read-note needs the exact key', () => {
		const e = ex({ kind: 'read-note', targets: [60] });
		expect(isAnswerCorrect(e, 72)).toBe(false);
		expect(isAnswerCorrect(e, 60)).toBe(true);
	});
});

describe('checkStep', () => {
	const e = ex({ kind: 'play-melody', targets: [60, 62, 64] });

	it('wrong step', () => {
		expect(checkStep(e, 1, 65)).toEqual({ correct: false, done: false });
	});

	it('correct middle step', () => {
		expect(checkStep(e, 1, 62)).toEqual({ correct: true, done: false });
	});

	it('correct last step', () => {
		expect(checkStep(e, 2, 64)).toEqual({ correct: true, done: true });
	});
});

describe('skillId / parseSkillId', () => {
	it('round-trips all 48 refs', () => {
		for (const ref of ALL_REFS) {
			expect(parseSkillId(skillId(ref))).toEqual(ref);
		}
	});

	it.each(['nope', 'read-note/up/1', 'read-note/right/9'])('rejects %s', (id) => {
		expect(parseSkillId(id)).toBeNull();
	});
});

describe('generateMixedRound', () => {
	it('alternates skills and never repeats targets[0]', () => {
		const a: SkillRef = { kind: 'read-note', hand: 'right', level: 1 };
		const b: SkillRef = { kind: 'find-key', hand: 'left', level: 2 };
		const round = generateMixedRound([a, b], 7, 6);
		expect(round.map((e) => e.skill)).toEqual([a, b, a, b, a, b]);
		for (let i = 1; i < round.length; i++) {
			expect(round[i]!.targets[0]).not.toBe(round[i - 1]!.targets[0]);
		}
	});
});
