import type { Clef, Hand } from '../music/notes';

export type ExerciseKind = 'name-key' | 'find-key' | 'read-note' | 'play-melody';
export const EXERCISE_KINDS: readonly ExerciseKind[] = ['name-key', 'find-key', 'read-note', 'play-melody'];
export type Level = 1 | 2 | 3 | 4;
export const LEVELS: readonly Level[] = [1, 2, 3, 4];
export const HANDS: readonly Hand[] = ['right', 'left', 'both'];

export interface SkillRef {
	kind: ExerciseKind;
	hand: Hand;
	level: Level;
}

/** 'read-note/right/2' */
export function skillId(ref: SkillRef): string {
	return `${ref.kind}/${ref.hand}/${ref.level}`;
}

export function parseSkillId(id: string): SkillRef | null {
	if (id.split('/').length !== 3) return null;
	const [kind, hand, level] = id.split('/');
	const lv = Number(level);
	if (!EXERCISE_KINDS.includes(kind as ExerciseKind)) return null;
	if (!HANDS.includes(hand as Hand)) return null;
	if (!LEVELS.includes(lv as Level)) return null;
	return { kind: kind as ExerciseKind, hand: hand as Hand, level: lv as Level };
}

export interface Exercise {
	/** `${skillId}#${index}` within a round. */
	id: string;
	skill: SkillRef;
	kind: ExerciseKind;
	/** Clef of the first target. */
	clef: Clef;
	/** 1 midi for name-key/find-key/read-note; 3–5 for play-melody. */
	targets: number[];
	/** name-key only: 4 midi numbers incl. the target, distinct pitch classes, shuffled. */
	choices?: number[];
	octaveMatters: boolean;
	/** Key range the keyboard should show (inclusive). */
	range: { lo: number; hi: number };
}

/** done = the whole exercise is finished after this step. */
export interface StepResult {
	correct: boolean;
	done: boolean;
}
