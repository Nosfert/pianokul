import { describe, expect, it } from 'vitest';
import { isLang, LANG_LOCALE, LANGS } from './lang';
import { pick, randInt, seededRng, shuffle } from './rng';
import { addDays, daysBetween, localDateString } from './dates';

describe('core helpers', () => {
	it('lang', () => {
		expect(LANGS).toEqual(['sv', 'en']);
		expect(LANG_LOCALE.sv).toBe('sv-SE');
		expect(LANG_LOCALE.en).toBe('en-GB');
		expect(isLang('sv')).toBe(true);
		expect(isLang('de')).toBe(false);
	});
	it('rng is deterministic', () => {
		const a = seededRng(42);
		const b = seededRng(42);
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
		const r = seededRng(1);
		for (let i = 0; i < 100; i++) {
			const n = randInt(r, 3, 7);
			expect(n).toBeGreaterThanOrEqual(3);
			expect(n).toBeLessThanOrEqual(7);
		}
		expect(shuffle(seededRng(5), [1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
		expect([1, 2, 3]).toContain(pick(seededRng(9), [1, 2, 3]));
	});
	it('dates', () => {
		expect(addDays('2026-10-07', 1)).toBe('2026-10-08');
		expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
		expect(daysBetween('2026-10-05', '2026-10-07')).toBe(2);
		expect(localDateString(new Date(2026, 9, 7))).toBe('2026-10-07');
	});
});
