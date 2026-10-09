import { LANGS, type Lang } from '../lang';

/**
 * Translation tables (pure, framework-free).
 *
 * Strings are registered as nested objects per language and flattened to
 * dotted keys: `{ runner: { check: 'Svara' } }` → `runner.check`.
 * A module registers its bundle with its module id as namespace, so the
 * units module's `{ title: 'Enheter' }` becomes `units.title`.
 *
 * - Variables: `'Hej {name}!'` + `{ name: 'Elliot' }`.
 * - Plurals: if `vars.count` is a number and `key_one` / `key_other` exist,
 *   that variant is used (`stars_one: '{count} stjärna'`, `stars_other: '{count} stjärnor'`).
 * - Lists: a value may be a string[]; `pickRandom` picks one (varied praise).
 */
export type StringValue = string | string[];
export interface StringTree {
	[key: string]: StringValue | StringTree;
}
export type StringBundle = Record<Lang, StringTree>;
export type Vars = Record<string, string | number>;

const tables: Record<Lang, Map<string, StringValue>> = { sv: new Map(), en: new Map() };
const warned = new Set<string>();
const isDev = Boolean(import.meta.env?.DEV);

function flatten(tree: StringTree, prefix: string, out: Map<string, StringValue>) {
	for (const [k, v] of Object.entries(tree)) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (typeof v === 'string' || Array.isArray(v)) out.set(key, v);
		else flatten(v, key, out);
	}
}

/** Returns the keys that exist in one language but not the other (useful in tests). */
export function registerStrings(bundle: StringBundle, namespace = ''): string[] {
	const flat: Record<Lang, Map<string, StringValue>> = { sv: new Map(), en: new Map() };
	for (const lang of LANGS) {
		flatten(bundle[lang] ?? {}, namespace, flat[lang]);
		for (const [k, v] of flat[lang]) tables[lang].set(k, v);
	}
	const missing: string[] = [];
	for (const k of flat.sv.keys()) if (!flat.en.has(k)) missing.push(`en:${k}`);
	for (const k of flat.en.keys()) if (!flat.sv.has(k)) missing.push(`sv:${k}`);
	if (isDev && missing.length) console.warn('[i18n] untranslated strings:', missing);
	return missing;
}

function lookup(lang: Lang, key: string, vars?: Vars): StringValue | undefined {
	if (vars && typeof vars.count === 'number') {
		const variant = tables[lang].get(vars.count === 1 ? `${key}_one` : `${key}_other`);
		if (variant !== undefined) return variant;
	}
	return tables[lang].get(key);
}

function resolve(lang: Lang, key: string, vars?: Vars): StringValue | undefined {
	const v = lookup(lang, key, vars);
	if (v !== undefined) return v;
	const warnKey = `${lang}:${key}`;
	if (isDev && !warned.has(warnKey)) {
		warned.add(warnKey);
		console.warn(`[i18n] missing string "${key}" (${lang})`);
	}
	return lookup(lang === 'sv' ? 'en' : 'sv', key, vars);
}

export function interpolate(s: string, vars?: Vars): string {
	if (!vars) return s;
	return s.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}

/** Translate `key` into `lang`. Falls back to the other language, then to the key itself. */
export function translate(lang: Lang, key: string, vars?: Vars): string {
	const v = resolve(lang, key, vars);
	if (v === undefined) return key;
	return interpolate(Array.isArray(v) ? (v[0] ?? key) : v, vars);
}

export function translateList(lang: Lang, key: string, vars?: Vars): string[] {
	const v = resolve(lang, key, vars);
	if (v === undefined) return [key];
	return (Array.isArray(v) ? v : [v]).map((s) => interpolate(s, vars));
}

export function pickRandom(
	lang: Lang,
	key: string,
	vars?: Vars,
	rng: () => number = Math.random
): string {
	const list = translateList(lang, key, vars);
	return list[Math.floor(rng() * list.length)] ?? key;
}

export function hasTranslation(lang: Lang, key: string): boolean {
	return tables[lang].has(key);
}
