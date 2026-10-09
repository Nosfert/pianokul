import { registerStrings, translate, pickRandom, type StringBundle, type Vars } from '$lib/core/i18n/translate';
import type { Lang } from '$lib/core/lang';
import { coreStrings } from '$lib/core/i18n/strings';
import { settings } from './settings.svelte';

registerStrings(coreStrings);

/**
 * Extra UI string bundles: any `<name>.strings.ts` file under src/lib that default-exports
 * `{ namespace, strings }` is registered automatically (e.g. namespace
 * 'insights' → t('insights.title')). Lets features add strings without
 * editing the shared core/i18n/strings.ts.
 */
const extra = import.meta.glob<{ default: { namespace: string; strings: StringBundle } }>('/src/lib/**/*.strings.ts', {
	eager: true
});
for (const mod of Object.values(extra)) registerStrings(mod.default.strings, mod.default.namespace);

/**
 * Translate a UI string into the current UI language. Reactive: using
 * `t(...)` in a template re-renders when the language is toggled.
 */
export function t(key: string, vars?: Vars): string {
	return translate(settings.value.uiLang, key, vars);
}

/** Random variant of a list-valued UI string (praise, encouragement). */
export function tRandom(key: string, vars?: Vars): string {
	return pickRandom(settings.value.uiLang, key, vars);
}

/**
 * Translate into a specific language — use for PRACTICE content that must
 * follow the exercise's practice language, not the UI language.
 */
export function tIn(lang: Lang, key: string, vars?: Vars): string {
	return translate(lang, key, vars);
}

export function uiLang(): Lang {
	return settings.value.uiLang;
}
