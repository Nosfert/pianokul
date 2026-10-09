import { detectPitch, type PitchFrame } from '$lib/core/music/pitch';

export interface MicHandlers {
	onFrame(frame: PitchFrame): void;
}

export interface MicConnection {
	readonly sampleRate: number;
	stop(): void;
}

export type MicError = 'unsupported' | 'denied' | 'failed';

export function micSupported(): boolean {
	return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== 'undefined';
}

const FRAME = 2048;
const HOP_MS = 25;

/**
 * Opens the microphone and calls `onFrame` ~40 times a second with a pitch
 * estimate of the latest 2048 samples. Speech-oriented processing is turned
 * off: echo cancellation, noise suppression and auto gain smear piano tones.
 * Must be started from a user gesture (iOS needs it for getUserMedia and AudioContext).
 */
export async function startMic(h: MicHandlers): Promise<MicConnection> {
	if (!micSupported()) throw Object.assign(new Error('unsupported'), { code: 'unsupported' as MicError });
	let stream: MediaStream;
	try {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 }
		});
	} catch (e) {
		const name = (e as DOMException)?.name;
		const code: MicError = name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'failed';
		throw Object.assign(new Error(code), { code });
	}
	const ctx = new AudioContext();
	// Never block on resume(): without user activation the promise can stay pending forever.
	// The frame loop below keeps retrying until the context runs.
	if (ctx.state !== 'running') void ctx.resume().catch(() => {});
	const source = ctx.createMediaStreamSource(stream);
	// Remove rumble (footsteps, pedal thumps) below the lowest note we care about.
	const highpass = ctx.createBiquadFilter();
	highpass.type = 'highpass';
	highpass.frequency.value = 55;
	const analyser = ctx.createAnalyser();
	analyser.fftSize = FRAME;
	analyser.smoothingTimeConstant = 0;
	source.connect(highpass);
	highpass.connect(analyser);
	const buf = new Float32Array(FRAME);
	let stopped = false;
	const timer = setInterval(() => {
		if (stopped) return;
		if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
		analyser.getFloatTimeDomainData(buf);
		h.onFrame(detectPitch(buf, ctx.sampleRate));
	}, HOP_MS);
	return {
		sampleRate: ctx.sampleRate,
		stop() {
			if (stopped) return;
			stopped = true;
			clearInterval(timer);
			source.disconnect();
			for (const track of stream.getTracks()) track.stop();
			void ctx.close().catch(() => {});
		}
	};
}
