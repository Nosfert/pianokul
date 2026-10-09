// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { setUiLang } from '$lib/stores/settings.svelte';
import { midiToFrequency } from '$lib/audio/synth';
import type { Exercise } from '$lib/core/exercises/types';

const mocks = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));
vi.mock('$lib/input/micInput', () => ({
	micSupported: () => true,
	startMic: mocks.start
}));

import { mic, micCalibration, migrateCalibration } from './mic.svelte';
import ExerciseRunner from '$lib/components/ExerciseRunner.svelte';

const tone = (midi: number) => ({ freq: midiToFrequency(midi), clarity: 0.95, rms: 0.05 });
const silence = { freq: null, clarity: 0, rms: 0 };
function strike(midi: number) {
	for (let i = 0; i < 6; i++) mic.feed(tone(midi));
	for (let i = 0; i < 10; i++) mic.feed(silence);
}

describe('mic store', () => {
	it('migrates junk calibration to defaults', () => {
		expect(migrateCalibration({ gate: 'x', tuningCents: 900 })).toEqual({ version: 1, gate: 0.004, tuningCents: 0, at: null });
		expect(migrateCalibration({ gate: 0.01, tuningCents: -20, at: '2026-10-09' })).toMatchObject({ gate: 0.01, tuningCents: -20 });
	});
	it('reports a friendly error when the microphone is denied', async () => {
		mocks.start.mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'denied' }));
		expect(await mic.start()).toBe(false);
		expect(mic.status).toBe('denied');
	});
	it('answers an exercise from a key heard on the real piano', async () => {
		setUiLang('en');
		micCalibration.reset();
		mocks.start.mockResolvedValueOnce({ sampleRate: 48000, stop: mocks.stop });
		const ex: Exercise = { id: 'x', kind: 'find-key', skill: { kind: 'find-key', hand: 'right', level: 1 }, targets: [64], octaveMatters: true, range: { lo: 60, hi: 67 } } as Exercise;
		const onOutcome = vi.fn();
		const { container } = render(ExerciseRunner, { props: { exercises: [ex], mode: 'practice', onOutcome, onDone: vi.fn() } });
		await fireEvent.click(screen.getByRole('button', { name: /Listen to my piano/ }));
		expect(mic.on).toBe(true);
		strike(62);
		expect(await screen.findByText(/Not quite/)).toBeTruthy();
		expect(screen.getByText('I heard: D4')).toBeTruthy();
		expect(container.querySelector('[data-midi="62"]')!.classList.contains('is-wrong')).toBe(true);
		strike(64);
		expect(await screen.findByText(/Correct!/)).toBeTruthy();
		expect(onOutcome).toHaveBeenCalledWith(ex, expect.objectContaining({ correct: true, firstTry: false }));
		mic.stop();
		expect(mocks.stop).toHaveBeenCalled();
		expect(mic.status).toBe('off');
	});
});
