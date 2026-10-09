// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Staff from './Staff.svelte';
import { setUiLang } from '$lib/stores/settings.svelte';

describe('Staff', () => {
	it('places treble notes on the right y and draws ledger lines', () => {
		setUiLang('en');
		const { container } = render(Staff, { props: { clef: 'treble', notes: [{ midi: 60 }, { midi: 64 }, { midi: 77 }], lineGap: 10 } });
		const ys = [...container.querySelectorAll('g.note')].map((g) => Number(g.getAttribute('data-position-y')));
		// bottom line y = 80: C4 (pos -2) → 90, E4 (pos 0) → 80, F5 (pos 8) → 40
		expect(ys).toEqual([90, 80, 40]);
		expect(container.querySelectorAll('g.note .ledger')).toHaveLength(1);
		expect(container.querySelector('svg')!.getAttribute('aria-label')).toBe('Notes: C4, E4, F5');
		expect(container.querySelectorAll('[data-clef="treble"]')).toHaveLength(1);
	});

	it('bass clef', () => {
		const { container } = render(Staff, { props: { clef: 'bass', notes: [{ midi: 43 }, { midi: 53 }, { midi: 60 }], lineGap: 10 } });
		const ys = [...container.querySelectorAll('g.note')].map((g) => Number(g.getAttribute('data-position-y')));
		// G2 (pos 0) → 80, F3 (pos 6) → 50, C4 (pos 10) → 30 with one ledger line
		expect(ys).toEqual([80, 50, 30]);
		expect(container.querySelectorAll('g.note .ledger')).toHaveLength(1);
		expect(container.querySelectorAll('[data-clef="bass"]')).toHaveLength(1);
	});

	it('grand staff routes notes by clefFor and draws two staves with a brace', () => {
		const { container } = render(Staff, { props: { clef: 'grand', notes: [{ midi: 48 }, { midi: 60 }, { midi: 67 }], lineGap: 10 } });
		expect(container.querySelectorAll('[data-clef]')).toHaveLength(2);
		expect(container.querySelector('.brace')).not.toBeNull();
		const ys = [...container.querySelectorAll('g.note')].map((g) => Number(g.getAttribute('data-position-y')));
		// bass bottom line y = 200: C3 (pos 3) → 185. treble: C4 → 90, G4 (pos 2) → 70
		expect(ys).toEqual([185, 90, 70]);
	});

	it('shows accidentals, names, states and the empty label', () => {
		setUiLang('en');
		const { container } = render(Staff, { props: { clef: 'treble', notes: [{ midi: 61, state: 'current' }, { midi: 63, accidental: 'flat', state: 'wrong' }], showNames: true } });
		const acc = container.querySelectorAll('.accidental');
		expect(acc[0]!.textContent).toBe('♯');
		expect(acc[1]!.textContent).toBe('♭');
		const names = container.querySelectorAll('.name');
		expect(names[0]!.textContent).toBe('C♯4');
		expect(names[1]!.textContent).toBe('E♭4');
		expect(container.querySelector('g.note')!.classList.contains('state-current')).toBe(true);
		expect(container.querySelectorAll('.mark')).toHaveLength(1);
		const empty = render(Staff, { props: { clef: 'treble' } });
		expect(empty.container.querySelector('svg')!.getAttribute('aria-label')).toBe('No notes');
		setUiLang('sv');
	});
});
