/** The two languages the app knows, both for the UI and for practice content. */
export type Lang = 'sv' | 'en';

export const LANGS: readonly Lang[] = ['sv', 'en'];

/** Language names are shown in their own language (endonyms), so they are not translated. */
export const LANG_NAME: Record<Lang, string> = { sv: 'Svenska', en: 'English' };
export const LANG_FLAG: Record<Lang, string> = { sv: '🇸🇪', en: '🇬🇧' };

/** BCP-47 tags: use for `lang` attributes, Intl and speechSynthesis voices. */
export const LANG_LOCALE: Record<Lang, string> = { sv: 'sv-SE', en: 'en-GB' };

export function isLang(v: unknown): v is Lang {
	return v === 'sv' || v === 'en';
}

/** Format a number the way the practice language writes it (sv: 3,5 — en: 3.5). */
export function formatNumber(n: number, lang: Lang, maxFractionDigits = 3): string {
	return new Intl.NumberFormat(LANG_LOCALE[lang], {
		maximumFractionDigits: maxFractionDigits,
		useGrouping: false
	}).format(n);
}
