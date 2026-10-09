/**
 * Tiny polyphonic Web Audio synth (no samples). One AudioContext, one
 * compressor as a soft limiter, a voice per held note. Safe to import in
 * node/tests: `getSynth()` returns a silent no-op synth when `AudioContext`
 * does not exist.
 */
export interface Synth {
	noteOn(midi: number, velocity?: number): void;
	noteOff(midi: number): void;
	allOff(): void;
	/** Resume the AudioContext (autoplay policy); call from a user gesture. */
	resume(): Promise<void>;
	readonly ready: boolean;
	/** performance.now() time after which the speaker is quiet again (Infinity while a note sounds). */
	readonly quietAt: number;
}

export function midiToFrequency(midi: number): number {
	return 440 * 2 ** ((midi - 69) / 12);
}

const NOOP: Synth = {
	noteOn() {},
	noteOff() {},
	allOff() {},
	resume: () => Promise.resolve(),
	ready: false,
	quietAt: 0
};

interface Voice {
	osc1: OscillatorNode;
	osc2: OscillatorNode;
	gain: GainNode;
	timer: ReturnType<typeof setTimeout>;
}

const ATTACK = 0.005;
const DECAY = 0.25;
const SUSTAIN = 0.4;
const RELEASE = 0.3;
const AUTO_RELEASE_MS = 2500;
const MASTER_GAIN = 0.3;

class WebAudioSynth implements Synth {
	readonly #ctx: AudioContext;
	readonly #out: GainNode;
	readonly #voices = new Map<number, Voice>();
	#releasedAt = 0;

	constructor(ctx: AudioContext) {
		this.#ctx = ctx;
		const limiter = ctx.createDynamicsCompressor();
		limiter.threshold.value = -12;
		limiter.knee.value = 20;
		limiter.ratio.value = 8;
		limiter.attack.value = 0.003;
		limiter.release.value = 0.2;
		this.#out = ctx.createGain();
		this.#out.gain.value = MASTER_GAIN;
		this.#out.connect(limiter);
		limiter.connect(ctx.destination);
	}

	get quietAt(): number {
		// Release tail plus room echo before the microphone may trust what it hears again.
		return this.#voices.size ? Infinity : this.#releasedAt + RELEASE * 1000 + 250;
	}

	get ready(): boolean {
		return this.#ctx.state === 'running';
	}

	async resume(): Promise<void> {
		if (this.#ctx.state !== 'running') await this.#ctx.resume();
	}

	noteOn(midi: number, velocity = 0.8): void {
		if (this.#voices.has(midi)) this.noteOff(midi);
		const ctx = this.#ctx;
		const now = ctx.currentTime;
		const freq = midiToFrequency(midi);
		const osc1 = ctx.createOscillator();
		osc1.type = 'triangle';
		osc1.frequency.value = freq;
		const osc2 = ctx.createOscillator();
		osc2.type = 'sine';
		osc2.frequency.value = freq * 2;
		const osc2Gain = ctx.createGain();
		osc2Gain.gain.value = 0.25;
		const filter = ctx.createBiquadFilter();
		filter.type = 'lowpass';
		filter.frequency.value = Math.min(8000, freq * 6);
		const gain = ctx.createGain();
		const peak = Math.max(0.05, Math.min(1, velocity));
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(peak, now + ATTACK);
		gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak * SUSTAIN), now + ATTACK + DECAY);
		osc1.connect(filter);
		osc2.connect(osc2Gain);
		osc2Gain.connect(filter);
		filter.connect(gain);
		gain.connect(this.#out);
		osc1.start(now);
		osc2.start(now);
		const timer = setTimeout(() => this.noteOff(midi), AUTO_RELEASE_MS);
		this.#voices.set(midi, { osc1, osc2, gain, timer });
	}

	noteOff(midi: number): void {
		const v = this.#voices.get(midi);
		if (!v) return;
		this.#voices.delete(midi);
		this.#releasedAt = performance.now();
		clearTimeout(v.timer);
		const now = this.#ctx.currentTime;
		v.gain.gain.cancelScheduledValues(now);
		v.gain.gain.setValueAtTime(v.gain.gain.value, now);
		v.gain.gain.exponentialRampToValueAtTime(0.001, now + RELEASE);
		v.osc1.stop(now + RELEASE + 0.05);
		v.osc2.stop(now + RELEASE + 0.05);
	}

	allOff(): void {
		for (const midi of [...this.#voices.keys()]) this.noteOff(midi);
	}
}

let instance: Synth | null = null;

/** Lazy singleton. Creates the AudioContext on first call (do it from a user gesture). */
export function getSynth(): Synth {
	if (instance) return instance;
	const Ctor = typeof AudioContext !== 'undefined' ? AudioContext : undefined;
	instance = Ctor ? new WebAudioSynth(new Ctor()) : NOOP;
	return instance;
}

/** Test hook: forget the singleton so the next getSynth() creates a new one. */
export function resetSynthForTests(): void {
	instance = null;
}
