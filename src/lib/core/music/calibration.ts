import { NoteTracker } from './noteTracker';
import { freqToMidiFloat, median, type PitchFrame } from './pitch';

/** "Play this key" steps: middle C, E and G — easy to find and well inside the mic's sweet spot. */
export const CALIBRATION_TARGETS = [60, 64, 67] as const;
/** ~1 s of room noise at the mic's frame rate. */
export const QUIET_FRAMES = 40;
const NOTE_FRAMES = 8;
const MAX_CENTS = 60;

export type CalFeedback = { kind: 'ok' | 'wrong' | 'octave'; heard: number } | null;

export interface CalibrationResult {
	gate: number;
	tuningCents: number;
}

/**
 * Calibration as a pure state machine fed with pitch frames:
 * 1. listen to the quiet room → noise gate,
 * 2. ask for each target key → piano tuning offset (cents) from the median pitch.
 * A wrong key (or the right letter in the wrong octave) gives feedback and asks again.
 */
export class Calibrator {
	phase: 'quiet' | 'note' | 'done' = 'quiet';
	index = 0;
	feedback: CalFeedback = null;
	gate = 0.004;
	readonly targets: readonly number[];
	#quiet: number[] = [];
	#cents: number[] = [];
	#tracker: NoteTracker | null = null;
	#collect: { midi: number; values: number[] } | null = null;

	constructor(targets: readonly number[] = CALIBRATION_TARGETS) {
		this.targets = targets;
	}

	get target(): number {
		return this.targets[Math.min(this.index, this.targets.length - 1)];
	}

	get quietProgress(): number {
		return Math.min(1, this.#quiet.length / QUIET_FRAMES);
	}

	/** Returns true when something visible changed (phase, step or feedback). */
	push(frame: PitchFrame): boolean {
		if (this.phase === 'done') return false;
		if (this.phase === 'quiet') {
			this.#quiet.push(frame.rms);
			if (this.#quiet.length < QUIET_FRAMES) return false;
			// Gate a bit above the room noise; clamp so a silent or noisy room still works.
			this.gate = Math.min(0.05, Math.max(0.003, median(this.#quiet) * 3));
			this.#tracker = new NoteTracker({ gate: this.gate, lo: 24, hi: 100 });
			this.phase = 'note';
			return true;
		}
		const tracker = this.#tracker!;
		for (const e of tracker.push(frame)) {
			if (e.type === 'on') this.#collect = { midi: e.midi, values: [] };
			else if (this.#collect?.midi === e.midi) this.#collect = null;
		}
		const c = this.#collect;
		if (!c || frame.freq === null || frame.clarity < tracker.o.minClarity) return false;
		const mf = freqToMidiFloat(frame.freq);
		if (Math.abs(mf - c.midi) <= 1) c.values.push(mf);
		if (c.values.length < NOTE_FRAMES) return false;
		this.#collect = null;
		const heard = median(c.values);
		const d = heard - this.target;
		const nearest = Math.round(heard);
		if (Math.abs(d) * 100 <= MAX_CENTS) {
			this.#cents.push(d * 100);
			this.feedback = { kind: 'ok', heard: this.target };
			this.index++;
			if (this.index >= this.targets.length) this.phase = 'done';
		} else {
			const octave = Math.round(d) !== 0 && Math.round(d) % 12 === 0;
			this.feedback = { kind: octave ? 'octave' : 'wrong', heard: nearest };
		}
		return true;
	}

	result(): CalibrationResult {
		const cents = this.#cents.length ? median(this.#cents) : 0;
		return { gate: this.gate, tuningCents: Math.round(Math.max(-MAX_CENTS, Math.min(MAX_CENTS, cents))) };
	}
}
