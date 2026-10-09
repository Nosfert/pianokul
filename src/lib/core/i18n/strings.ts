import type { StringBundle } from './translate';

/** Shared UI strings. Feature strings live in src/lib/strings/<name>.strings.ts bundles. */
export const coreStrings: StringBundle = {
	sv: {
		app: {
			name: 'Pianokul',
			greeting: 'Hej! Vad vill du göra idag?',
			tagline: 'Lär dig spela piano – en tangent i taget.',
			home: 'Hem',
			back: 'Tillbaka',
			skipToContent: 'Hoppa till innehållet',
			mainNav: 'Sidor',
			sections: 'Välj vad du vill göra',
			badges: 'Mina märken',
			settings: 'Inställningar',
			uiLanguage: 'Språk i appen',
			notFound: 'Hoppsan! Den sidan finns inte.',
			notFoundText: 'Men pianot finns kvar. Gå tillbaka till startsidan och fortsätt spela.',
			toHome: 'Till startsidan'
		},
		home: {
			learn: 'Lär dig',
			learnSub: 'Tangenter, noter och klaver',
			practice: 'Öva',
			practiceSub: 'Träna med tips när du behöver',
			test: 'Testa dig',
			testSub: 'Visa vad du kan och ta ett märke',
			play: 'Spela fritt',
			playSub: 'Bara spela – med mus, tangentbord eller MIDI'
		},
		stars: {
			label: 'Stjärnor',
			count_one: '{count} stjärna',
			count_other: '{count} stjärnor',
			earned: '+{count} ⭐',
			seeBadges: 'Se dina märken'
		},
		streak: {
			label: 'Dagar i rad',
			days_one: '{count} dag i rad',
			days_other: '{count} dagar i rad',
			none: 'Öva idag så startar du en svit!'
		},
		celebrate: {
			close: 'Hurra! 🎉',
			closeHelp: 'Tryck Esc eller knappen för att stänga'
		},
		common: {
			next: 'Nästa',
			previous: 'Föregående',
			done: 'Klar',
			start: 'Starta',
			cancel: 'Avbryt',
			yes: 'Ja',
			no: 'Nej',
			close: 'Stäng',
			of: '{n} av {total}'
		},
		praise: {
			correct: ['Rätt! Snyggt! 🎉', 'Ja! Det satt! 🌟', 'Helt rätt! 💪', 'Perfekt träff! 🎯', 'Du har koll! ✨'],
			tryAgain: [
				'Inte riktigt – prova igen!',
				'Nära! Lyssna och titta en gång till. 👀',
				'Hmm, inte den. Du hittar rätt snart!',
				'Bra försök! Testa en tangent till.'
			]
		}
	},
	en: {
		app: {
			name: 'Pianokul',
			greeting: 'Hi! What do you want to do today?',
			tagline: 'Learn to play the piano – one key at a time.',
			home: 'Home',
			back: 'Back',
			skipToContent: 'Skip to content',
			mainNav: 'Pages',
			sections: 'Choose what to do',
			badges: 'My badges',
			settings: 'Settings',
			uiLanguage: 'App language',
			notFound: 'Oops! That page does not exist.',
			notFoundText: 'But the piano is still here. Go back to the start page and keep playing.',
			toHome: 'To the start page'
		},
		home: {
			learn: 'Learn',
			learnSub: 'Keys, notes and clefs',
			practice: 'Practise',
			practiceSub: 'Train with hints when you need them',
			test: 'Test yourself',
			testSub: 'Show what you know and earn a badge',
			play: 'Free play',
			playSub: 'Just play – with mouse, keyboard or MIDI'
		},
		stars: {
			label: 'Stars',
			count_one: '{count} star',
			count_other: '{count} stars',
			earned: '+{count} ⭐',
			seeBadges: 'See your badges'
		},
		streak: {
			label: 'Days in a row',
			days_one: '{count} day in a row',
			days_other: '{count} days in a row',
			none: 'Practise today to start a streak!'
		},
		celebrate: {
			close: 'Hooray! 🎉',
			closeHelp: 'Press Esc or the button to close'
		},
		common: {
			next: 'Next',
			previous: 'Previous',
			done: 'Done',
			start: 'Start',
			cancel: 'Cancel',
			yes: 'Yes',
			no: 'No',
			close: 'Close',
			of: '{n} of {total}'
		},
		praise: {
			correct: ['Correct! Nice! 🎉', 'Yes! Nailed it! 🌟', 'Exactly right! 💪', 'Perfect hit! 🎯', 'You know this! ✨'],
			tryAgain: [
				'Not quite – try again!',
				'Close! Look and listen once more. 👀',
				"Hmm, not that one. You'll find it soon!",
				'Good try! Test another key.'
			]
		}
	}
};
