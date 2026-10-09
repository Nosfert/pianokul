import type { StringBundle } from '$lib/core/i18n/translate';
export default { namespace: 'mic', strings: {
  sv: {
    toggleOn: '🎤 Lyssna på mitt piano', toggleOff: 'Sluta lyssna', starting: 'Startar mikrofonen…',
    listening: 'Jag lyssnar på ditt piano', heard: 'Jag hörde: {name}', level: 'Ljudnivå',
    calibrate: 'Ställ in pianot', recalibrate: 'Ställ in igen', notCalibrated: 'Tips: ställ in pianot först så hör jag bättre.',
    unsupported: 'Den här webbläsaren kan inte lyssna med mikrofonen. Du kan spela på skärmen.',
    denied: 'Jag får inte använda mikrofonen. Tillåt mikrofonen i webbläsarens inställningar, eller spela på skärmen.',
    failed: 'Mikrofonen gick inte att starta. Du kan spela på skärmen så länge.',
    title: 'Ställ in ditt piano', intro: 'Ställ iPaden på notstället, nära tangenterna. Jag lyssnar på några toner så att jag vet hur just ditt piano låter.',
    start: 'Starta', quiet: 'Var helt tyst en liten stund…', playThis: 'Spela den här tangenten: {name}',
    playHelp: 'Tryck en gång, ganska starkt, och låt tonen klinga.', middleC: 'Det är C i mitten – den vita tangenten till vänster om de två svarta tangenterna mitt på pianot.',
    ok: '✓ Ja! Det var {name}.', wrong: 'Jag hörde {name}. Leta efter den markerade tangenten och prova igen.', octave: 'Rätt ton, men fel oktav! Prova den som är närmast mitten.',
    step: 'Ton {n} av {total}', done: 'Klart! Nu känner jag igen ditt piano. 🎉', tuning: 'Ditt piano är stämt {cents} cent från standard.',
    tryIt: 'Prova: spela vad du vill så visar jag vad jag hör.', finish: 'Klar', cancel: 'Avbryt', back: 'Tillbaka till inställningarna',
    tip: 'Funkar bäst i ett tyst rum. Spela en tangent i taget. Vill du spela på skärmen istället går det alltid.',
    settingsTitle: 'Riktigt piano', settingsHelp: 'Låt Pianokul lyssna på ditt riktiga piano genom mikrofonen och säga om du spelade rätt.'
  },
  en: {
    toggleOn: '🎤 Listen to my piano', toggleOff: 'Stop listening', starting: 'Starting the microphone…',
    listening: 'I am listening to your piano', heard: 'I heard: {name}', level: 'Sound level',
    calibrate: 'Set up my piano', recalibrate: 'Set up again', notCalibrated: 'Tip: set up your piano first so I can hear it better.',
    unsupported: 'This browser cannot listen with the microphone. You can play on the screen.',
    denied: 'I am not allowed to use the microphone. Allow it in the browser settings, or play on the screen.',
    failed: 'The microphone could not start. You can play on the screen for now.',
    title: 'Set up your piano', intro: 'Put the iPad on the music stand, close to the keys. I will listen to a few notes so I know how your piano sounds.',
    start: 'Start', quiet: 'Stay very quiet for a moment…', playThis: 'Play this key: {name}',
    playHelp: 'Press it once, fairly firmly, and let it ring.', middleC: 'That is middle C – the white key just left of the two black keys in the middle of the piano.',
    ok: '✓ Yes! That was {name}.', wrong: 'I heard {name}. Look for the highlighted key and try again.', octave: 'Right note, wrong octave! Try the one closest to the middle.',
    step: 'Note {n} of {total}', done: 'Done! Now I know your piano. 🎉', tuning: 'Your piano is tuned {cents} cents from standard pitch.',
    tryIt: 'Try it: play anything and I will show what I hear.', finish: 'Done', cancel: 'Cancel', back: 'Back to settings',
    tip: 'Works best in a quiet room. Play one key at a time. You can always play on the screen instead.',
    settingsTitle: 'Real piano', settingsHelp: 'Let Pianokul listen to your real piano through the microphone and tell you if you played the right key.'
  }
} satisfies StringBundle };
