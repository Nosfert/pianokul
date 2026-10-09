import { getSynth } from '$lib/audio/synth';
import { Calibrator } from '$lib/core/music/calibration';
import { NoteTracker } from '$lib/core/music/noteTracker';
import type { PitchFrame } from '$lib/core/music/pitch';
import { micSupported, startMic, type MicConnection, type MicError } from '$lib/input/micInput';
import { Persisted } from './persisted.svelte';

export interface MicCalibration {
	version: 1;
	/** Noise gate (RMS) measured in the child's room. */
	gate: number;
	/** How far the real piano is from A440, in cents. */
	tuningCents: number;
	/** ISO date of the last calibration, or null when never calibrated. */
	at: string | null;
}

function defaults(): MicCalibration {
	return { version: 1, gate: 0.004, tuningCents: 0, at: null };
}

export function migrateCalibration(raw: unknown): MicCalibration {
	const base = defaults();
	if (!raw || typeof raw !== 'object') return base;
	const r = raw as Partial<MicCalibration>;
	const num = (v: unknown, lo: number, hi: number, d: number) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : d);
	return {
		version: 1,
		gate: num(r.gate, 0.001, 0.1, base.gate),
		tuningCents: num(r.tuningCents, -100, 100, base.tuningCents),
		at: typeof r.at === 'string' ? r.at : null
	};
}

export const micCalibration = new Persisted<MicCalibration>('mic.v1', defaults, migrateCalibration);

type Status = 'off' | 'starting' | 'on' | MicError;
type NoteListener = (midi: number) => void;

/**
 * App-wide "real piano" microphone. One connection shared by every page;
 * pages subscribe to heard notes with `onMicNote`. While a Calibrator is
 * attached, frames go to it instead of the note tracker.
 */
class MicStore {
	status = $state<Status>('off');
	/** Smoothed input level 0..1 for the listening indicator. */
	level = $state(0);
	/** Last key heard (after calibration), for display. */
	heard = $state<number | null>(null);
	/** Bumped on every heard note so UIs can flash. */
	beat = $state(0);
	calibrator = $state.raw<Calibrator | null>(null);
	/** Bumped when the calibrator's visible state changes. */
	calTick = $state(0);

	#conn: MicConnection | null = null;
	#tracker = new NoteTracker();
	#listeners = new Set<NoteListener>();
	/** Ignore the mic until this time (the last calibration note is still ringing). */
	#mutedUntil = 0;

	get supported(): boolean {
		return micSupported();
	}

	get on(): boolean {
		return this.status === 'on';
	}

	#newTracker() {
		const c = micCalibration.value;
		this.#tracker = new NoteTracker({ gate: c.gate, tuningCents: c.tuningCents });
	}

	async start(): Promise<boolean> {
		if (this.#conn || this.status === 'starting') return this.status === 'on';
		this.status = 'starting';
		try {
			this.#newTracker();
			this.#conn = await startMic({ onFrame: (f) => this.#frame(f) });
			this.status = 'on';
			return true;
		} catch (e) {
			this.status = ((e as { code?: MicError }).code ?? 'failed') as Status;
			return false;
		}
	}

	stop() {
		this.#conn?.stop();
		this.#conn = null;
		this.calibrator = null;
		this.level = 0;
		this.heard = null;
		this.status = 'off';
	}

	async toggle() {
		if (this.#conn) this.stop();
		else await this.start();
	}

	onMicNote(listener: NoteListener): () => void {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	beginCalibration(): Calibrator {
		this.calibrator = new Calibrator();
		this.calTick++;
		return this.calibrator;
	}

	finishCalibration() {
		const cal = this.calibrator;
		if (!cal || cal.phase !== 'done') return;
		const r = cal.result();
		micCalibration.value = { version: 1, gate: r.gate, tuningCents: r.tuningCents, at: new Date().toISOString() };
		this.calibrator = null;
		this.#newTracker();
		this.#mutedUntil = performance.now() + 1500;
	}

	cancelCalibration() {
		this.calibrator = null;
	}

	/** Test/debug hook: feed a frame as if it came from the microphone. */
	feed(frame: PitchFrame) {
		this.#frame(frame);
	}

	#frame(frame: PitchFrame) {
		this.level = this.level * 0.7 + Math.min(1, frame.rms * 12) * 0.3;
		// Echo guard: ignore what the app's own synth is playing through the speaker.
		const now = performance.now();
		if (now < getSynth().quietAt || now < this.#mutedUntil) {
			this.#tracker.reset();
			return;
		}
		if (this.calibrator) {
			if (this.calibrator.push(frame)) this.calTick++;
			return;
		}
		for (const e of this.#tracker.push(frame)) {
			if (e.type !== 'on') continue;
			this.heard = e.midi;
			this.beat++;
			for (const l of this.#listeners) l(e.midi);
		}
	}
}

export const mic = new MicStore();
