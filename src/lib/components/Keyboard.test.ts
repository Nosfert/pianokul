// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import Keyboard from './Keyboard.svelte';
import { setSvNaming, setUiLang } from '$lib/stores/settings.svelte';

describe('Keyboard', () => {
	it('renders one button per key with aria-labels and fires onNoteOn/onNoteOff', async () => {
		setUiLang('en');
		const onNoteOn = vi.fn();
		const onNoteOff = vi.fn();
		const { container } = render(Keyboard, { props: { lo: 60, hi: 72, onNoteOn, onNoteOff, highlight: { 64: 'target' } } });
		const keys = container.querySelectorAll('button[data-midi]');
		expect(keys).toHaveLength(13);
		expect(container.querySelectorAll('button.black')).toHaveLength(5);
		expect(keys[0]!.getAttribute('aria-label')).toBe('Key C4');
		const e4 = container.querySelector('[data-midi="64"]')!;
		expect(e4.classList.contains('is-target')).toBe(true);
		await fireEvent.pointerDown(e4, { pointerId: 1, button: 0, pointerType: 'mouse' });
		expect(onNoteOn).toHaveBeenCalledWith(64);
		expect(e4.getAttribute('aria-pressed')).toBe('true');
		await fireEvent.pointerUp(window, { pointerId: 1 });
		expect(onNoteOff).toHaveBeenCalledWith(64);
		expect(e4.getAttribute('aria-pressed')).toBe('false');
	});

	it('snaps a range starting on a black key to white keys and shows labels', () => {
		setUiLang('en');
		const { container } = render(Keyboard, { props: { lo: 61, hi: 70, labels: 'all' } });
		expect(container.querySelector('[data-midi="60"]')).not.toBeNull();
		expect(container.querySelector('[data-midi="71"]')).not.toBeNull();
		expect(container.querySelector('[data-midi="60"] .name')!.textContent).toBe('C4');
		expect(container.querySelector('[data-midi="61"] .name')!.textContent).toBe('C♯');
		expect(container.querySelector('[data-midi="71"] .name')!.textContent).toBe('B');
	});

	it('uses Swedish H by default and B when the setting says so', () => {
		setUiLang('sv');
		setSvNaming('H');
		const a = render(Keyboard, { props: { lo: 71, hi: 72, labels: 'white' } });
		expect(a.container.querySelector('[data-midi="71"] .name')!.textContent).toBe('H');
		setSvNaming('B');
		const b = render(Keyboard, { props: { lo: 71, hi: 72, labels: 'white' } });
		expect(b.container.querySelector('[data-midi="71"] .name')!.textContent).toBe('B');
		setSvNaming('H');
		setUiLang('sv');
	});

	it('plays on Space keydown and shows externally pressed keys', async () => {
		const onNoteOn = vi.fn();
		const { container } = render(Keyboard, { props: { lo: 60, hi: 64, onNoteOn, pressed: [62], computerLabels: { 60: 'A' } } });
		expect(container.querySelector('[data-midi="62"]')!.getAttribute('aria-pressed')).toBe('true');
		expect(container.querySelector('[data-midi="60"] .ckey')!.textContent).toBe('A');
		await fireEvent.keyDown(container.querySelector('[data-midi="60"]')!, { key: ' ' });
		expect(onNoteOn).toHaveBeenCalledWith(60);
	});

	it('does nothing when disabled', async () => {
		const onNoteOn = vi.fn();
		const { container } = render(Keyboard, { props: { lo: 60, hi: 64, onNoteOn, disabled: true } });
		await fireEvent.pointerDown(container.querySelector('[data-midi="60"]')!, { pointerId: 2, button: 0, pointerType: 'mouse' });
		expect(onNoteOn).not.toHaveBeenCalled();
	});
});
