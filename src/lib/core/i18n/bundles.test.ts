import { describe, expect, it } from 'vitest';
import { registerStrings, type StringBundle } from './translate';
import { coreStrings } from './strings';

/** Every feature string bundle in the project. Later tickets add files; this test checks them all. */
const bundles = import.meta.glob<{ default: { namespace: string; strings: StringBundle } }>(
	'/src/lib/**/*.strings.ts',
	{ eager: true }
);

describe('string bundles', () => {
	it('core strings have sv/en parity', () => {
		expect(registerStrings(coreStrings)).toEqual([]);
	});

	it('every *.strings.ts bundle has a lowercase namespace and sv/en parity', () => {
		for (const [path, mod] of Object.entries(bundles)) {
			expect(mod.default.namespace, path).toMatch(/^[a-z]+$/);
			expect(registerStrings(mod.default.strings, mod.default.namespace), path).toEqual([]);
		}
	});

	it('namespaces are unique', () => {
		const names = Object.values(bundles).map((m) => m.default.namespace);
		expect(new Set(names).size).toBe(names.length);
	});
});
