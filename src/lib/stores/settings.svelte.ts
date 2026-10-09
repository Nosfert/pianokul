import { isLang, type Lang } from '$lib/core/lang';
import { Persisted } from './persisted.svelte';

export type Hand = 'right' | 'left' | 'both';
/** Swedish naming of the note after A: traditional 'H' (B = B♭) or international 'B'. */
export type SvNaming = 'H' | 'B';

export interface Settings {
	version: 1;
	uiLang: Lang;
	hand: Hand;
	svNaming: SvNaming;
	sound: boolean;
	keyLabels: boolean;
	reduceMotion: boolean;
}

function defaults(): Settings {
	return { version: 1, uiLang: 'sv', hand: 'right', svNaming: 'H', sound: true, keyLabels: true, reduceMotion: false };
}

/** Defensive load; settings saved before a field existed get its default. */
export function migrateSettings(raw: unknown): Settings {
	const base = defaults();
	if (!raw || typeof raw !== 'object') return base;
	const r = raw as Partial<Settings>;
	return {
		version: 1,
		uiLang: isLang(r.uiLang) ? r.uiLang : base.uiLang,
		hand: r.hand === 'left' || r.hand === 'both' ? r.hand : 'right',
		svNaming: r.svNaming === 'B' ? 'B' : 'H',
		sound: r.sound !== false,
		keyLabels: r.keyLabels !== false,
		reduceMotion: r.reduceMotion === true
	};
}

export const settings = new Persisted<Settings>('settings.v1', defaults, migrateSettings);

export function setUiLang(lang: Lang) {
	settings.update((s) => ({ ...s, uiLang: lang }));
}
export function setHand(hand: Hand) {
	settings.update((s) => ({ ...s, hand }));
}
export function setSvNaming(svNaming: SvNaming) {
	settings.update((s) => ({ ...s, svNaming }));
}
export function setSound(sound: boolean) {
	settings.update((s) => ({ ...s, sound }));
}
export function setKeyLabels(keyLabels: boolean) {
	settings.update((s) => ({ ...s, keyLabels }));
}
export function setReduceMotion(reduceMotion: boolean) {
	settings.update((s) => ({ ...s, reduceMotion }));
}

/** Options for note names in the current UI language (pass to noteName / noteNameWithOctave). */
export function naming(): { lang: Lang; svNaming: SvNaming } {
	return { lang: settings.value.uiLang, svNaming: settings.value.svNaming };
}
