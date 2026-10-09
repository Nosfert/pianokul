import type { StringBundle } from '$lib/core/i18n/translate';

export default {
	namespace: 'keyboard',
	strings: {
		sv: {
			label: 'Pianoklaviatur',
			key: 'Tangent {name}',
			middleC: 'Ettstrukna C (C4)'
		},
		en: {
			label: 'Piano keyboard',
			key: 'Key {name}',
			middleC: 'Middle C (C4)'
		}
	} satisfies StringBundle
};
