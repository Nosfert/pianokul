import type { StringBundle } from '$lib/core/i18n/translate';

export default {
	namespace: 'staff',
	strings: {
		sv: {
			label: 'Notsystem',
			treble: 'G-klav (diskantklav)',
			bass: 'F-klav (basklav)',
			grand: 'Dubbelt notsystem',
			notes: 'Noter: {list}',
			empty: 'Inga noter'
		},
		en: {
			label: 'Staff',
			treble: 'Treble clef (G clef)',
			bass: 'Bass clef (F clef)',
			grand: 'Grand staff',
			notes: 'Notes: {list}',
			empty: 'No notes'
		}
	} satisfies StringBundle
};
