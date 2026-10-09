import { allKeysBetween, clefFor, isBlackKey, pitchClass, whiteKeysBetween, type Hand } from '../music/notes';
import { pick, randInt, seededRng, shuffle, type Rng } from '../rng';
import type { Exercise, ExerciseKind, Level, SkillRef, StepResult } from './types';
import { skillId } from './types';

const MIDI_LO = 21;
const MIDI_HI = 108;

/** Inclusive MIDI ranges per single hand and level. */
const HAND_RANGES: Record<'right' | 'left', Record<Level, { lo: number; hi: number }>> = {
	right: {
		1: { lo: 60, hi: 67 },
		2: { lo: 60, hi: 72 },
		3: { lo: 57, hi: 79 },
		4: { lo: 60, hi: 72 }
	},
	left: {
		1: { lo: 53, hi: 60 },
		2: { lo: 48, hi: 60 },
		3: { lo: 41, hi: 64 },
		4: { lo: 48, hi: 60 }
	}
};

export function rangeFor(hand: Hand, level: Level): { lo: number; hi: number } {
	if (hand === 'both') {
		return { lo: rangeFor('left', level).lo, hi: rangeFor('right', level).hi };
	}
	const r = HAND_RANGES[hand][level];
	return { lo: r.lo, hi: r.hi };
}

/** Ascending, unique; white keys only for levels 1–3, all keys for level 4; both = union. */
export function poolFor(hand: Hand, level: Level): number[] {
	if (hand === 'both') {
		const union = new Set([...poolFor('left', level), ...poolFor('right', level)]);
		return [...union].sort((a, b) => a - b);
	}
	const { lo, hi } = rangeFor(hand, level);
	return level === 4 ? allKeysBetween(lo, hi) : whiteKeysBetween(lo, hi).filter((m) => !isBlackKey(m));
}

/** False only for find-key at level 1 (any octave counts). */
export function octaveMatters(kind: ExerciseKind, level: Level): boolean {
	return !(kind === 'find-key' && level === 1);
}

/** lo rounds down to a C; hi stays if it is a C, else rounds up to a B. Clamped to 21..108. */
export function keyboardRange(hand: Hand, level: Level): { lo: number; hi: number } {
	const r = rangeFor(hand, level);
	const lo = r.lo - pitchClass(r.lo);
	const hi = pitchClass(r.hi) === 0 ? r.hi : r.hi + (11 - pitchClass(r.hi));
	return { lo: Math.max(MIDI_LO, lo), hi: Math.min(MIDI_HI, hi) };
}

export function melodyLength(level: Level): number {
	return level === 1 ? 3 : level === 2 ? 4 : 5;
}

function pickFirst(rng: Rng, pool: readonly number[], avoidMidi?: number): number {
	const candidates = pool.length > 1 && avoidMidi !== undefined ? pool.filter((m) => m !== avoidMidi) : pool;
	return pick(rng, candidates);
}

function nameKeyChoices(rng: Rng, pool: readonly number[], target: number): number[] {
	const choices = [target];
	const classes = new Set([pitchClass(target)]);
	while (choices.length < 4) {
		const m = pick(rng, pool);
		if (classes.has(pitchClass(m))) continue;
		classes.add(pitchClass(m));
		choices.push(m);
	}
	return shuffle(rng, choices);
}

function melody(rng: Rng, pool: readonly number[], level: Level, avoidMidi?: number): number[] {
	const notes = [pickFirst(rng, pool, avoidMidi)];
	const len = melodyLength(level);
	while (notes.length < len) {
		const prev = notes[notes.length - 1] as number;
		const prevIdx = pool.indexOf(prev);
		const candidates = pool.filter(
			(m, i) => m !== prev && (level > 2 || Math.abs(i - prevIdx) <= 4)
		);
		notes.push(candidates[randInt(rng, 0, candidates.length - 1)] as number);
	}
	return notes;
}

/** targets[0] !== avoidMidi whenever the pool has more than one entry. */
export function generateExercise(ref: SkillRef, rng: Rng, index: number, avoidMidi?: number): Exercise {
	const pool = poolFor(ref.hand, ref.level);
	let targets: number[];
	let choices: number[] | undefined;
	if (ref.kind === 'play-melody') {
		targets = melody(rng, pool, ref.level, avoidMidi);
	} else {
		targets = [pickFirst(rng, pool, avoidMidi)];
		if (ref.kind === 'name-key') choices = nameKeyChoices(rng, pool, targets[0] as number);
	}
	const ex: Exercise = {
		id: `${skillId(ref)}#${index}`,
		skill: { kind: ref.kind, hand: ref.hand, level: ref.level },
		kind: ref.kind,
		clef: clefFor(targets[0] as number),
		targets,
		octaveMatters: octaveMatters(ref.kind, ref.level),
		range: keyboardRange(ref.hand, ref.level)
	};
	if (choices) ex.choices = choices;
	return ex;
}

export function generateRound(ref: SkillRef, seed: number, count = 10): Exercise[] {
	const rng = seededRng(seed);
	const out: Exercise[] = [];
	for (let i = 0; i < count; i++) {
		const previous = out[out.length - 1];
		out.push(generateExercise(ref, rng, i, previous?.targets[0]));
	}
	return out;
}

/** Exercise i uses refs[i % refs.length]; consecutive exercises never share targets[0]. */
export function generateMixedRound(refs: SkillRef[], seed: number, count = 10): Exercise[] {
	if (refs.length === 0) return [];
	const rng = seededRng(seed);
	const out: Exercise[] = [];
	for (let i = 0; i < count; i++) {
		const previous = out[out.length - 1];
		out.push(generateExercise(refs[i % refs.length] as SkillRef, rng, i, previous?.targets[0]));
	}
	return out;
}

export function isAnswerCorrect(ex: Exercise, answerMidi: number, step = 0): boolean {
	const target = ex.targets[step];
	if (target === undefined) return false;
	switch (ex.kind) {
		case 'name-key':
			return pitchClass(answerMidi) === pitchClass(target);
		case 'find-key':
			return ex.octaveMatters ? answerMidi === target : pitchClass(answerMidi) === pitchClass(target);
		case 'read-note':
		case 'play-melody':
			return answerMidi === target;
	}
}

export function checkStep(ex: Exercise, step: number, answerMidi: number): StepResult {
	const correct = isAnswerCorrect(ex, answerMidi, step);
	return { correct, done: correct && step === ex.targets.length - 1 };
}
