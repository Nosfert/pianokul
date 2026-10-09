import type { StringBundle } from '$lib/core/i18n/translate';
export default { namespace: 'exercise', strings: {
  sv: {
    kind: {'name-key':'Vad heter tangenten?','find-key':'Hitta tangenten','read-note':'Läs noter','play-melody':'Spela en melodi',mixed:'Blandat'},
    hand:{right:'Höger hand',left:'Vänster hand',both:'Båda händerna'},
    level:{'1':'Nivå 1','2':'Nivå 2','3':'Nivå 3','4':'Nivå 4'},
    levelHelp:{'1':'Fem toner att börja med','2':'En oktav','3':'Fler toner och hjälplinjer','4':'Svarta tangenter också'},
    choose:'Välj din utmaning',kindLabel:'Vad vill du öva på?',handLabel:'Vilken hand?',levelLabel:'Hur svårt?',
    prompts:{'name-key':'Vad heter den markerade tangenten?','find-key':'Spela {name}.','read-note':'Läs noten och spela rätt tangent.','play-melody':'Spela noterna från vänster till höger, en i taget.'},
    anyOctave:'Du får välja vilken oktav du vill.',exactOctave:'Siffran visar oktaven. C4 är C i mitten.',
    position:'Fråga {n} av {total}',step:'Ton {n} av {total}',correct:'✓ Rätt! Snyggt spelat!',wrong:'🤔 Inte riktigt. Titta en gång till och prova igen.',
    hint:'Tips: namnen syns nu. Följ noten som är inringad.',reveal:'Här är svaret: {name}. Prova det och gå sedan vidare.',
    saved:'Svar sparat. Gå vidare när du är redo.',next:'Nästa fråga',finish:'Se resultatet',summary:'Du är klar!',score:'{score} av {total} lösta frågor',
    earned:'Du fick {count} stjärnor.',testLabel:'Läs notbilden och spela svaret. Notnamnen är dolda under testet.',
    keyboardHelp:'Du kan också tabba till en tangent och trycka mellanslag eller Enter.'
  },
  en: {
    kind: {'name-key':'Name the key','find-key':'Find the key','read-note':'Read notes','play-melody':'Play a melody',mixed:'Mixed'},
    hand:{right:'Right hand',left:'Left hand',both:'Both hands'},
    level:{'1':'Level 1','2':'Level 2','3':'Level 3','4':'Level 4'},
    levelHelp:{'1':'Five notes to start with','2':'One octave','3':'More notes and ledger lines','4':'Black keys too'},
    choose:'Choose your challenge',kindLabel:'What do you want to practise?',handLabel:'Which hand?',levelLabel:'How hard?',
    prompts:{'name-key':'What is the highlighted key called?','find-key':'Play {name}.','read-note':'Read the note and play the matching key.','play-melody':'Play the notes from left to right, one at a time.'},
    anyOctave:'You can choose any octave.',exactOctave:'The number tells you the octave. C4 is middle C.',
    position:'Question {n} of {total}',step:'Note {n} of {total}',correct:'✓ Correct! Nicely played!',wrong:'🤔 Not quite. Take another look and try again.',
    hint:'Hint: the names are visible now. Follow the circled note.',reveal:'Here is the answer: {name}. Try it, then move on.',
    saved:'Answer saved. Move on when you are ready.',next:'Next question',finish:'See the result',summary:'You did it!',score:'{score} of {total} questions solved',
    earned:'You earned {count} stars.',testLabel:'Read the music and play your answer. Note names are hidden during the test.',
    keyboardHelp:'You can also Tab to a key and press Space or Enter.'
  }
} satisfies StringBundle };
