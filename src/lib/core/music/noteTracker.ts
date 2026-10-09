import { freqToMidiFloat, type PitchFrame } from './pitch';

export type NoteEvent = { type: 'on'; midi: number } | { type: 'off'; midi: number };

export interface TrackerOptions {
	/** Consecutive frames that must agree before a note is reported. */
	stableFrames?: number;
	/** Minimum MPM clarity for a frame to count as a tone. */
	minClarity?: number;
	/** Noise gate: RMS below this is silence. */
	gate?: number;
	/** Piano tuning offset in cents (from calibration). */
	tuningCents?: number;
	/** Whole-semitone shift (e.g. a transposed digital piano), from calibration. */
	transpose?: number;
	/** Unvoiced frames before the current note is released. */
	releaseFrames?: number;
	/** RMS jump (vs. the recent minimum) that counts as a new key strike. */
	onsetRatio?: number;
	/** Lowest/highest MIDI note reported. */
	lo?: number;
	hi?: number;
}

const DEFAULTS: Required<TrackerOptions> = {
	stableFrames: 3,
	minClarity: 0.8,
	gate: 0.004,
	tuningCents: 0,
	transpose: 0,
	releaseFrames: 8,
	onsetRatio: 1.6,
	lo: 36,
	hi: 88
};

/** Intervals a ringing note can "jump" to when the detector locks onto an overtone. */
const OVERTONE_JUMPS = new Set([12, 19, 24, 28, 31, 36]);
const ONSET_WINDOW = 8;

/**
 * Turns a stream of pitch frames into key strikes. Reports a note once when
 * it starts (not every frame it rings), reports a re-strike of the same key
 * when the level jumps, and ignores the octave/overtone flicker of a
 * decaying piano string unless a fresh strike is heard.
 */
export class NoteTracker {
	readonly o: Required<TrackerOptions>;
	current: number | null = null;
	#candidate: number | null = null;
	#count = 0;
	#silent = 0;
	#recent: number[] = [];
	#onsetArmed = 0;

	constructor(options: TrackerOptions = {}) {
		this.o = { ...DEFAULTS, ...options };
	}

	/** Midi number for a frame, or null if the frame is not a usable tone. */
	midiOf(frame: PitchFrame): number | null {
		if (frame.freq === null || frame.clarity < this.o.minClarity || frame.rms < this.o.gate) return null;
		const midi = Math.round(freqToMidiFloat(frame.freq, this.o.tuningCents)) - this.o.transpose;
		return midi >= this.o.lo && midi <= this.o.hi ? midi : null;
	}

	push(frame: PitchFrame): NoteEvent[] {
		const events: NoteEvent[] = [];
		const low = this.#recent.length ? Math.min(...this.#recent) : 0;
		const prev = this.#recent.length ? this.#recent[this.#recent.length - 1] : 0;
		// Rising edge only: a long attack must not keep re-arming (and resetting) the onset.
		const rising = frame.rms > prev * 1.15;
		if (rising && this.#onsetArmed === 0 && frame.rms >= this.o.gate * 1.5 && frame.rms > Math.max(low, this.o.gate / 2) * this.o.onsetRatio) {
			// Fresh strike: the pitch must re-stabilise, and a same-key re-strike is reported.
			this.#onsetArmed = ONSET_WINDOW;
			this.#count = 0;
		}
		this.#recent.push(frame.rms);
		if (this.#recent.length > 5) this.#recent.shift();

		const midi = this.midiOf(frame);
		if (midi === null) {
			this.#candidate = null;
			this.#count = 0;
			if (++this.#silent >= this.o.releaseFrames && this.current !== null) {
				events.push({ type: 'off', midi: this.current });
				this.current = null;
			}
			if (this.#onsetArmed > 0) this.#onsetArmed--;
			return events;
		}
		this.#silent = 0;
		if (midi === this.#candidate) this.#count++;
		else {
			this.#candidate = midi;
			this.#count = 1;
		}
		const onset = this.#onsetArmed > 0;
		if (this.#count >= this.o.stableFrames) {
			if (this.current === null) {
				events.push({ type: 'on', midi });
				this.current = midi;
				this.#onsetArmed = 0;
			} else if (midi !== this.current) {
				// A different note without a fresh strike: allow legato steps, but not
				// overtone/octave jumps of the same ringing string.
				const jump = Math.abs(midi - this.current);
				const legato = !OVERTONE_JUMPS.has(jump) && this.#count >= this.o.stableFrames * 2;
				if (onset || legato) {
					events.push({ type: 'off', midi: this.current }, { type: 'on', midi });
					this.current = midi;
					this.#onsetArmed = 0;
				}
			} else if (onset && this.#count === this.o.stableFrames) {
				// Same key struck again (pitch was briefly lost/unstable during the attack).
				events.push({ type: 'off', midi }, { type: 'on', midi });
				this.#onsetArmed = 0;
			}
		}
		if (this.#onsetArmed > 0) this.#onsetArmed--;
		return events;
	}

	/** Forget all state (e.g. after calibration or when the mic restarts). */
	reset(): NoteEvent[] {
		const out: NoteEvent[] = this.current === null ? [] : [{ type: 'off', midi: this.current }];
		this.current = null;
		this.#candidate = null;
		this.#count = 0;
		this.#silent = 0;
		this.#recent = [];
		this.#onsetArmed = 0;
		return out;
	}
}
