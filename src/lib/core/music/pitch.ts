/**
 * Monophonic pitch detection for a real piano heard through a microphone.
 * Pure functions, no Web Audio: easy to test with synthesized buffers.
 *
 * Algorithm: McLeod Pitch Method (normalized square difference function,
 * "A Smarter Way to Find Pitch", McLeod & Wyvill 2005). It picks the first
 * strong periodicity peak, which keeps octave errors low for piano tones
 * whose overtones are often louder than the fundamental.
 */

export interface PitchFrame {
	/** Detected fundamental in Hz, or null when nothing periodic was heard. */
	freq: number | null;
	/** 0..1, height of the chosen NSDF peak. ~0.9+ is a clean tone. */
	clarity: number;
	/** Root-mean-square level of the frame (0..1 for float audio). */
	rms: number;
}

export interface PitchOptions {
	minFreq?: number;
	maxFreq?: number;
	/** Fraction of the highest NSDF peak a candidate must reach (MPM "k"). */
	threshold?: number;
	/** Frames quieter than this are reported as silent without analysis. */
	minRms?: number;
}

const DEFAULTS: Required<PitchOptions> = { minFreq: 60, maxFreq: 1400, threshold: 0.9, minRms: 0.002 };

export function rms(buf: ArrayLike<number>): number {
	let sum = 0;
	for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
	return buf.length ? Math.sqrt(sum / buf.length) : 0;
}

/** Halve the sample rate by averaging pairs (cheap anti-aliasing for >= 44.1 kHz input). */
function downsample(buf: ArrayLike<number>): Float32Array {
	const out = new Float32Array(Math.floor(buf.length / 2));
	for (let i = 0; i < out.length; i++) out[i] = (buf[2 * i] + buf[2 * i + 1]) / 2;
	return out;
}

export function detectPitch(input: ArrayLike<number>, sampleRate: number, options: PitchOptions = {}): PitchFrame {
	const o = { ...DEFAULTS, ...options };
	const level = rms(input);
	if (level < o.minRms) return { freq: null, clarity: 0, rms: level };
	let buf: ArrayLike<number> = input;
	let sr = sampleRate;
	// 48 kHz → 24 kHz is plenty for notes up to C7 and makes the O(n·lag) loop 4x cheaper.
	if (sr >= 44100 && o.maxFreq * 4 < sr) {
		buf = downsample(input);
		sr /= 2;
	}
	const n = buf.length;
	const minLag = Math.max(2, Math.floor(sr / o.maxFreq));
	const maxLag = Math.min(n - 2, Math.ceil(sr / o.minFreq));
	if (maxLag <= minLag) return { freq: null, clarity: 0, rms: level };

	// Remove DC offset so the correlation reflects the waveform, not the bias.
	let mean = 0;
	for (let i = 0; i < n; i++) mean += buf[i];
	mean /= n;
	const x = new Float32Array(n);
	for (let i = 0; i < n; i++) x[i] = buf[i] - mean;

	// NSDF n'(τ) = 2·Σ x_j x_{j+τ} / Σ (x_j² + x_{j+τ}²). m(τ) is updated incrementally.
	const nsdf = new Float32Array(maxLag + 2);
	let m = 0;
	for (let i = 0; i < n; i++) m += 2 * x[i] * x[i];
	for (let tau = 0; tau <= maxLag + 1 && tau < n; tau++) {
		if (tau > 0) m -= x[tau - 1] * x[tau - 1] + x[n - tau] * x[n - tau];
		let r = 0;
		for (let j = 0; j < n - tau; j++) r += x[j] * x[j + tau];
		nsdf[tau] = m > 0 ? (2 * r) / m : 0;
	}

	// Key maxima: the highest point between each positive-going and negative-going zero crossing.
	const peaks: number[] = [];
	let tau = 1;
	while (tau < maxLag && nsdf[tau] > 0) tau++; // skip the τ=0 lobe
	while (tau < maxLag) {
		while (tau < maxLag && nsdf[tau] <= 0) tau++;
		let best = -1;
		while (tau < maxLag && nsdf[tau] > 0) {
			if (tau >= minLag && (best < 0 || nsdf[tau] > nsdf[best])) best = tau;
			tau++;
		}
		if (best > 0) peaks.push(best);
	}
	if (!peaks.length) return { freq: null, clarity: 0, rms: level };
	const highest = Math.max(...peaks.map((p) => nsdf[p]));
	const chosen = peaks.find((p) => nsdf[p] >= o.threshold * highest)!;

	// Parabolic interpolation around the peak for sub-sample accuracy.
	const a = nsdf[chosen - 1];
	const b = nsdf[chosen];
	const c = nsdf[chosen + 1];
	const denom = a - 2 * b + c;
	const shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0;
	const period = chosen + Math.max(-0.5, Math.min(0.5, shift));
	const clarity = Math.min(1, denom !== 0 ? b - 0.25 * (a - c) * shift : b);
	const freq = sr / period;
	if (freq < o.minFreq || freq > o.maxFreq) return { freq: null, clarity, rms: level };
	return { freq, clarity, rms: level };
}

/** Fractional MIDI number of a frequency (A4 = 440 Hz = 69), shifted by a tuning offset. */
export function freqToMidiFloat(freq: number, tuningCents = 0): number {
	return 69 + 12 * Math.log2(freq / 440) - tuningCents / 100;
}

/** Nearest MIDI key for a frequency on a piano tuned `tuningCents` away from A440. */
export function freqToMidi(freq: number, tuningCents = 0): number {
	return Math.round(freqToMidiFloat(freq, tuningCents));
}

export function median(values: number[]): number {
	if (!values.length) return NaN;
	const s = [...values].sort((a, b) => a - b);
	const mid = s.length >> 1;
	return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
