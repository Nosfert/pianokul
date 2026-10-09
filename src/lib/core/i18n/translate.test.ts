import { describe, expect, it } from 'vitest';
import { registerStrings, translate, translateList, type StringTree } from './translate';
import { coreStrings } from './strings';

function shape(tree: StringTree, prefix = '', out = new Map<string, string>()) {
	for (const [k, v] of Object.entries(tree)) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (typeof v === 'string') out.set(key, 'string');
		else if (Array.isArray(v)) out.set(key, 'list');
		else shape(v, key, out);
	}
	return out;
}

describe('i18n', () => {
	it('core strings exist in both languages', () => {
		expect(registerStrings(coreStrings)).toEqual([]);
	});

	it('translates with namespaces, variables and plurals', () => {
		registerStrings(
			{
				sv: { hi: 'Hej {name}!', apples_one: '{count} äpple', apples_other: '{count} äpplen' },
				en: { hi: 'Hi {name}!', apples_one: '{count} apple', apples_other: '{count} apples' }
			},
			'test'
		);
		expect(translate('sv', 'test.hi', { name: 'Molly' })).toBe('Hej Molly!');
		expect(translate('en', 'test.hi', { name: 'Molly' })).toBe('Hi Molly!');
		expect(translate('sv', 'test.apples', { count: 1 })).toBe('1 äpple');
		expect(translate('en', 'test.apples', { count: 3 })).toBe('3 apples');
	});

	it('falls back to the other language, then the key', () => {
		registerStrings({ sv: { onlySv: 'bara svenska' }, en: {} }, 'fb');
		expect(translate('en', 'fb.onlySv')).toBe('bara svenska');
		expect(translate('en', 'fb.nothing')).toBe('fb.nothing');
	});

	it('list values give varied praise', () => {
		registerStrings(coreStrings);
		expect(translateList('sv', 'praise.correct').length).toBeGreaterThan(2);
	});

	it('coreStrings: sv and en have the same keys and value kinds', () => {
		const sv = shape(coreStrings.sv);
		const en = shape(coreStrings.en);
		expect([...sv.keys()].sort()).toEqual([...en.keys()].sort());
		for (const [k, kind] of sv) expect(`${k}:${en.get(k)}`).toBe(`${k}:${kind}`);
		expect(sv.size).toBeGreaterThan(30);
	});

	it('plural keys come in _one/_other pairs', () => {
		for (const lang of ['sv', 'en'] as const) {
			const keys = [...shape(coreStrings[lang]).keys()];
			for (const k of keys.filter((x) => x.endsWith('_one'))) expect(keys).toContain(k.replace(/_one$/, '_other'));
		}
	});
});
