import type {Lang} from '$lib/core/lang';
import {noteName,type NamingOptions} from '$lib/core/music/notes';
export type TaskKind='press-key'|'press-all'|'press-sequence';
export interface LessonTask {kind:TaskKind;targets:number[];instruction:Record<Lang,string>}
export interface LessonStep {
  id:string;title:Record<Lang,string>;text:Record<Lang,string[]>;
  keyboard:{lo:number;hi:number;labels:'none'|'white'|'all'};
  staff?:{clef:'treble'|'bass'|'grand';notes:number[];accidental?:'sharp'|'flat'};task:LessonTask;
}
export interface Lesson {id:string;title:Record<Lang,string>;intro:Record<Lang,string>;steps:LessonStep[]}
export const lessons:Lesson[] =
[
  {
    "id": "keyboard",
    "title": {
      "sv": "Hitta på klaviaturen",
      "en": "Find your way around the keyboard"
    },
    "intro": {
      "sv": "Börja med mönstret av svarta tangenter. Det är din karta.",
      "en": "Start with the black-key pattern. It is your map."
    },
    "steps": [
      {
        "id": "keys",
        "title": {
          "sv": "Vita och svarta tangenter",
          "en": "White and black keys"
        },
        "text": {
          "sv": [
            "Varje tangent spelar en ton. Tangenter åt höger låter högre. Tangenter åt vänster låter lägre.",
            "Prova C4 och C5. Samma namn, men C5 låter högre!"
          ],
          "en": [
            "Each key plays a note. Keys to the right sound higher. Keys to the left sound lower.",
            "Try C4 and C5. Same name, but C5 sounds higher!"
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            60,
            72
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        }
      },
      {
        "id": "two",
        "title": {
          "sv": "Två svarta tillsammans",
          "en": "Two black keys together"
        },
        "text": {
          "sv": [
            "De svarta tangenterna ligger i grupper med två eller tre. Gruppen med två är lätt att känna igen.",
            "Spela Ciss4 och Diss4. Det är de två svarta tangenterna mellan C4 och E4."
          ],
          "en": [
            "Black keys come in groups of two or three. The group of two is easy to spot.",
            "Play C♯4 and D♯4. They are the two black keys between C4 and E4."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "all"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            61,
            63
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        }
      },
      {
        "id": "three",
        "title": {
          "sv": "Sedan kommer tre",
          "en": "Then come three"
        },
        "text": {
          "sv": [
            "Nästa grupp har tre svarta tangenter. Spela Fiss4, Giss4 och Aiss4.",
            "Två, tre, två, tre… Mönstret fortsätter över hela klaviaturen."
          ],
          "en": [
            "The next group has three black keys. Play F♯4, G♯4 and A♯4.",
            "Two, three, two, three… The pattern repeats across the keyboard."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "all"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            66,
            68,
            70
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        }
      },
      {
        "id": "find-c",
        "title": {
          "sv": "C gömmer sig till vänster",
          "en": "C is hiding on the left"
        },
        "text": {
          "sv": [
            "Hitta en grupp med två svarta tangenter. Den vita tangenten precis till vänster är C.",
            "Prova att hitta C4 utan namn på tangenterna. Den lilla pricken visar C i mitten."
          ],
          "en": [
            "Find a group of two black keys. The white key immediately to its left is C.",
            "Try finding C4 without key labels. The small dot marks middle C."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "none"
        },
        "task": {
          "kind": "press-key",
          "targets": [
            60
          ],
          "instruction": {
            "sv": "Spela C4, till vänster om gruppen med två svarta.",
            "en": "Play C4, to the left of the two black keys."
          }
        }
      },
      {
        "id": "octaves",
        "title": {
          "sv": "Samma mönster, ny oktav",
          "en": "Same pattern, new octave"
        },
        "text": {
          "sv": [
            "Från ett C till nästa C är det en oktav. Namnen börjar om, men tonerna blir högre.",
            "I Pianokul skriver vi C4 för C i mitten. C3 ligger en oktav lägre och C5 en oktav högre."
          ],
          "en": [
            "From one C to the next is an octave. The names start again, but the notes get higher.",
            "In Pianokul, C4 means middle C. C3 is one octave lower and C5 is one octave higher."
          ]
        },
        "keyboard": {
          "lo": 48,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            48,
            60,
            72
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        }
      }
    ]
  },
  {
    "id": "note-names",
    "title": {
      "sv": "Tangenternas namn",
      "en": "The names of the keys"
    },
    "intro": {
      "sv": "Sju namn räcker långt. Sedan börjar de om.",
      "en": "Seven names take you a long way. Then they repeat."
    },
    "steps": [
      {
        "id": "letters",
        "title": {
          "sv": "Sju namn i en loop",
          "en": "Seven names on repeat"
        },
        "text": {
          "sv": [
            "De vita tangenterna heter {letters}. Efter den sista börjar det om på C.",
            "Spela C4, D4 och E4. Säg namnen högt när du spelar."
          ],
          "en": [
            "The white keys are named C D E F G A B. After B, they start again at C.",
            "Play C4, D4 and E4. Say the names as you play."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            60,
            62,
            64
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        }
      },
      {
        "id": "h-b",
        "title": {
          "sv": "H eller B? Båda förekommer",
          "en": "H or B? Both are used"
        },
        "text": {
          "sv": [
            "I svensk tradition heter den vita tangenten efter A H. I många andra länder heter den B.",
            "Pianokul börjar med H på svenska. I Inställningar kan du välja B. I engelskt läge används alltid B. Just nu heter tangenten {B}."
          ],
          "en": [
            "In English, the white key after A is always called B. In the traditional Swedish system, it is called H.",
            "The Swedish settings let you choose H or B. They are two names for the same white key."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-key",
          "targets": [
            71
          ],
          "instruction": {
            "sv": "Spela {B}4, den vita tangenten precis före C5.",
            "en": "Play B4, the white key immediately before C5."
          }
        }
      },
      {
        "id": "sharp",
        "title": {
          "sv": "Korsförtecken höjer",
          "en": "A sharp raises the note"
        },
        "text": {
          "sv": [
            "Tecknet ♯ höjer tonen ett halvt tonsteg: till nästa tangent åt höger, vit eller svart.",
            "C♯ heter Ciss på svenska. Spela C4 och sedan Ciss4. Lyssna på det lilla steget."
          ],
          "en": [
            "The ♯ sign raises a note by one semitone: the next key to the right, white or black.",
            "Play C4, then C♯4. Listen to that small step."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "all"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            60,
            61
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "treble",
          "notes": [
            60,
            61
          ]
        }
      },
      {
        "id": "flat",
        "title": {
          "sv": "B-förtecken sänker",
          "en": "A flat lowers the note"
        },
        "text": {
          "sv": [
            "Tecknet ♭ sänker tonen ett halvt tonsteg: till nästa tangent åt vänster. D♭ heter Dess.",
            "Ciss och Dess är samma tangent, men skrivs olika i noterna. Den svarta tangenten under {B} heter {Bb} när vi skriver den med ♭."
          ],
          "en": [
            "The ♭ sign lowers a note by one semitone: the next key to the left.",
            "C♯ and D♭ are the same key, written differently in music. The black key below B is B♭."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "all"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            62,
            61
          ],
          "instruction": {
            "sv": "Spela D4 och sedan Dess4. Dess är samma tangent som Ciss.",
            "en": "Play D4, then D♭4. D♭ is the same key as C♯."
          }
        },
        "staff": {
          "clef": "treble",
          "notes": [
            62,
            61
          ],
          "accidental": "flat"
        }
      },
      {
        "id": "neighbours",
        "title": {
          "sv": "Ibland finns ingen svart emellan",
          "en": "Sometimes there is no black key between"
        },
        "text": {
          "sv": [
            "Mellan E och F finns ingen svart tangent. Inte heller mellan {B} och C. Där är steget redan ett halvt tonsteg.",
            "Spela E4 och F4, sedan {B}4 och C5."
          ],
          "en": [
            "There is no black key between E and F, or between B and C. Those neighbours are already one semitone apart.",
            "Play E4 and F4, then B4 and C5."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            64,
            65,
            71,
            72
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        }
      }
    ]
  },
  {
    "id": "treble",
    "title": {
      "sv": "Höger hand och G-klav",
      "en": "Right hand and treble clef"
    },
    "intro": {
      "sv": "Notlinjerna visar vilken ton du ska spela.",
      "en": "The staff tells you which note to play."
    },
    "steps": [
      {
        "id": "clef",
        "title": {
          "sv": "G-klaven visar vägen",
          "en": "The treble clef shows the way"
        },
        "text": {
          "sv": [
            "Ett notsystem har fem linjer. Noterna kan ligga på linjerna eller i mellanrummen.",
            "G-klavens snurr ligger runt den andra linjen nerifrån. Där ligger G4. Höger hand läser ofta G-klav."
          ],
          "en": [
            "A staff has five lines. Notes can sit on the lines or in the spaces.",
            "The treble clef curls around the second line from the bottom. That line is G4. The right hand often reads treble clef."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 79,
          "labels": "white"
        },
        "task": {
          "kind": "press-key",
          "targets": [
            67
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "treble",
          "notes": [
            67
          ]
        }
      },
      {
        "id": "lines",
        "title": {
          "sv": "Läs linjerna nerifrån",
          "en": "Read the lines from the bottom"
        },
        "text": {
          "sv": [
            "Linjerna heter E G {B} D F, nerifrån och upp. Siffran byter till 5 när vi passerar C5.",
            "En minnesmening: {trebleMnemonic} Spela E4, G4, {B}4, D5 och F5."
          ],
          "en": [
            "From bottom to top, the lines are E G B D F. The octave changes to 5 after B4.",
            "Try the memory phrase Every Good Boy Deserves Fun. Play E4, G4, B4, D5 and F5."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 79,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            64,
            67,
            71,
            74,
            77
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "treble",
          "notes": [
            64,
            67,
            71,
            74,
            77
          ]
        }
      },
      {
        "id": "spaces",
        "title": {
          "sv": "Mellanrummen säger FACE",
          "en": "The spaces spell FACE"
        },
        "text": {
          "sv": [
            "Mellanrummen heter F A C E, nerifrån och upp. FACE är engelska för ansikte – ett litet minnesknep.",
            "Spela F4, A4, C5 och E5. Följ noterna i bilden."
          ],
          "en": [
            "From bottom to top, the spaces spell F A C E: FACE. A handy memory trick!",
            "Play F4, A4, C5 and E5. Follow the notes in the picture."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 79,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            65,
            69,
            72,
            76
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "treble",
          "notes": [
            65,
            69,
            72,
            76
          ]
        }
      },
      {
        "id": "middle-c",
        "title": {
          "sv": "En hjälplinje för C4",
          "en": "A ledger line for C4"
        },
        "text": {
          "sv": [
            "C4 ligger strax under notsystemet i G-klav. Den lilla linjen genom noten kallas hjälplinje.",
            "Hjälplinjer låter oss skriva toner som ligger utanför de fem linjerna. Spela C4."
          ],
          "en": [
            "In treble clef, C4 sits just below the staff. The small line through the note is called a ledger line.",
            "Ledger lines let us write notes beyond the five staff lines. Play C4."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-key",
          "targets": [
            60
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "treble",
          "notes": [
            60
          ]
        }
      },
      {
        "id": "melody",
        "title": {
          "sv": "Din första lilla notmelodi",
          "en": "Your first little written melody"
        },
        "text": {
          "sv": [
            "Spela C4 D4 E4 D4 C4 med höger hand. Läs från vänster till höger och ta en ton i taget.",
            "När noten klättrar uppåt blir tonen högre. Du behöver inte spela snabbt."
          ],
          "en": [
            "Play C4 D4 E4 D4 C4 with your right hand. Read from left to right, one note at a time.",
            "When the notes climb up, the sound gets higher. There is no need to play fast."
          ]
        },
        "keyboard": {
          "lo": 60,
          "hi": 72,
          "labels": "none"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            60,
            62,
            64,
            62,
            60
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "treble",
          "notes": [
            60,
            62,
            64,
            62,
            60
          ]
        }
      }
    ]
  },
  {
    "id": "bass",
    "title": {
      "sv": "Vänster hand och F-klav",
      "en": "Left hand and bass clef"
    },
    "intro": {
      "sv": "Samma fem linjer, men andra toner.",
      "en": "The same five lines, but different notes."
    },
    "steps": [
      {
        "id": "clef",
        "title": {
          "sv": "F-klavens två prickar",
          "en": "The bass clef has two dots"
        },
        "text": {
          "sv": [
            "F-klaven används ofta för vänster hand och lägre toner. Prickarna sitter på var sin sida om den näst översta linjen.",
            "Den linjen är F3. Spela F3 och lyssna på den lägre tonen."
          ],
          "en": [
            "Bass clef is often used for the left hand and lower notes. Its two dots sit on either side of the second line from the top.",
            "That line is F3. Play F3 and listen to the lower sound."
          ]
        },
        "keyboard": {
          "lo": 36,
          "hi": 60,
          "labels": "white"
        },
        "task": {
          "kind": "press-key",
          "targets": [
            53
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "bass",
          "notes": [
            53
          ]
        }
      },
      {
        "id": "lines",
        "title": {
          "sv": "Fem baslinjer",
          "en": "Five bass lines"
        },
        "text": {
          "sv": [
            "Linjerna heter G {B} D F A, nerifrån och upp.",
            "En minnesmening: {bassMnemonic} Spela G2, {B}2, D3, F3 och A3."
          ],
          "en": [
            "From bottom to top, the lines are G B D F A.",
            "Try Good Bands Deserve Fun Always. Play G2, B2, D3, F3 and A3."
          ]
        },
        "keyboard": {
          "lo": 36,
          "hi": 60,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            43,
            47,
            50,
            53,
            57
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "bass",
          "notes": [
            43,
            47,
            50,
            53,
            57
          ]
        }
      },
      {
        "id": "spaces",
        "title": {
          "sv": "Mellanrummen i basen",
          "en": "The bass spaces"
        },
        "text": {
          "sv": [
            "Mellanrummen heter A C E G, nerifrån och upp. Alla Coola Elever Gillar… vad gillar du?",
            "Spela A2, C3, E3 och G3. Leta efter noterna mellan linjerna."
          ],
          "en": [
            "From bottom to top, the spaces are A C E G. Try All Cows Eat Grass.",
            "Play A2, C3, E3 and G3. Look for the notes between the lines."
          ]
        },
        "keyboard": {
          "lo": 36,
          "hi": 60,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            45,
            48,
            52,
            55
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "bass",
          "notes": [
            45,
            48,
            52,
            55
          ]
        }
      },
      {
        "id": "middle-c",
        "title": {
          "sv": "C4 kan höra till båda händerna",
          "en": "Either hand can play C4"
        },
        "text": {
          "sv": [
            "I F-klav skrivs C4 på en hjälplinje ovanför notsystemet. Det är samma tangent som C4 i G-klav.",
            "C4 är inte reserverat för en viss hand. I den här övningen spelar du det med vänster."
          ],
          "en": [
            "In bass clef, C4 is on a ledger line above the staff. It is the same key as C4 in treble clef.",
            "C4 does not belong to only one hand. In this exercise, play it with your left hand."
          ]
        },
        "keyboard": {
          "lo": 48,
          "hi": 60,
          "labels": "white"
        },
        "task": {
          "kind": "press-key",
          "targets": [
            60
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "bass",
          "notes": [
            60
          ]
        }
      },
      {
        "id": "melody",
        "title": {
          "sv": "En melodi för vänster",
          "en": "A left-hand melody"
        },
        "text": {
          "sv": [
            "Spela C3 D3 E3 D3 C3 med vänster hand. Följ noterna från vänster till höger.",
            "Du har lärt dig ett nytt notsystem – snyggt!"
          ],
          "en": [
            "Play C3 D3 E3 D3 C3 with your left hand. Follow the notes from left to right.",
            "You have learnt a new clef. Nicely done!"
          ]
        },
        "keyboard": {
          "lo": 48,
          "hi": 60,
          "labels": "none"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            48,
            50,
            52,
            50,
            48
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "bass",
          "notes": [
            48,
            50,
            52,
            50,
            48
          ]
        }
      }
    ]
  },
  {
    "id": "both-hands",
    "title": {
      "sv": "Båda händerna tillsammans",
      "en": "Bring both hands together"
    },
    "intro": {
      "sv": "Två notsystem, en klaviatur. Nu samarbetar händerna.",
      "en": "Two staves, one keyboard. Now your hands work together."
    },
    "steps": [
      {
        "id": "grand",
        "title": {
          "sv": "Ett dubbelt notsystem",
          "en": "The grand staff"
        },
        "text": {
          "sv": [
            "Pianonoter har ofta G-klav överst och F-klav underst. En klammer binder ihop dem till ett dubbelt notsystem.",
            "Överst läser oftast höger hand, underst vänster. Spela C3 med vänster och C4 med höger, en i taget."
          ],
          "en": [
            "Piano music often has treble clef above bass clef. A brace joins them into the grand staff.",
            "The right hand usually reads the top staff and the left reads the bottom. Play C3 with your left hand, then C4 with your right."
          ]
        },
        "keyboard": {
          "lo": 48,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            48,
            60
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "grand",
          "notes": [
            48,
            60
          ]
        }
      },
      {
        "id": "fingers",
        "title": {
          "sv": "Fingrarna har nummer",
          "en": "Your fingers have numbers"
        },
        "text": {
          "sv": [
            "På båda händerna är tummen 1, pekfingret 2, långfingret 3, ringfingret 4 och lillfingret 5.",
            "För höger hand: lägg tummen på C4 och fingrarna 2–5 på D4 E4 F4 G4. Spela dem i ordning. Slappna av och håll handleden mjuk."
          ],
          "en": [
            "On both hands: thumb 1, index finger 2, middle finger 3, ring finger 4, little finger 5.",
            "For your right hand, put your thumb on C4 and fingers 2–5 on D4 E4 F4 G4. Play them in order. Relax and keep your wrist comfortable."
          ]
        },
        "keyboard": {
          "lo": 48,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            60,
            62,
            64,
            65,
            67
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "treble",
          "notes": [
            60,
            62,
            64,
            65,
            67
          ]
        }
      },
      {
        "id": "left-fingers",
        "title": {
          "sv": "Vänster hand går åt andra hållet",
          "en": "The left hand runs the other way"
        },
        "text": {
          "sv": [
            "För vänster hand: lägg lillfingret 5 på C3 och tummen 1 på G3. D3 E3 F3 får fingrarna 4 3 2.",
            "Spela C3 D3 E3 F3 G3. På en riktig klaviatur blir det 5 4 3 2 1. Appen kan höra tonen, men inte vilket finger du använder."
          ],
          "en": [
            "For your left hand, put little finger 5 on C3 and thumb 1 on G3. Fingers 4 3 2 play D3 E3 F3.",
            "Play C3 D3 E3 F3 G3. On a real keyboard, that is 5 4 3 2 1. The app can check the note, but not which finger you use."
          ]
        },
        "keyboard": {
          "lo": 48,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            48,
            50,
            52,
            53,
            55
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "bass",
          "notes": [
            48,
            50,
            52,
            53,
            55
          ]
        }
      },
      {
        "id": "together",
        "title": {
          "sv": "Hitta två C med båda händerna",
          "en": "Find two Cs with both hands"
        },
        "text": {
          "sv": [
            "Hitta C3 med vänster hand och C4 med höger. Spela båda tonerna, i vilken ordning du vill.",
            "På en riktig klaviatur kan du sedan prova att trycka ned dem samtidigt. De passar ihop eftersom de ligger en oktav från varandra."
          ],
          "en": [
            "Find C3 with your left hand and C4 with your right. Play both notes in any order.",
            "On a real keyboard, then try holding them at the same time. They go well together because they are an octave apart."
          ]
        },
        "keyboard": {
          "lo": 48,
          "hi": 72,
          "labels": "white"
        },
        "task": {
          "kind": "press-all",
          "targets": [
            48,
            60
          ],
          "instruction": {
            "sv": "Spela C3 och C4, i vilken ordning du vill.",
            "en": "Play C3 and C4 in any order."
          }
        },
        "staff": {
          "clef": "grand",
          "notes": [
            48,
            60
          ]
        }
      },
      {
        "id": "switch",
        "title": {
          "sv": "Låt händerna turas om",
          "en": "Let your hands take turns"
        },
        "text": {
          "sv": [
            "Spela C3 med vänster, C4 med höger, D3 med vänster, D4 med höger och till sist C4 med höger.",
            "Ta det långsamt. Titta på vilket notsystem nästa ton ligger i. Nu kan du fortsätta på Öva och välja Båda händerna!"
          ],
          "en": [
            "Play C3 with your left, C4 with your right, D3 with your left, D4 with your right, then C4 with your right again.",
            "Take it slowly. Look at which staff holds the next note. Now try Practise and choose Both hands!"
          ]
        },
        "keyboard": {
          "lo": 48,
          "hi": 72,
          "labels": "none"
        },
        "task": {
          "kind": "press-sequence",
          "targets": [
            48,
            60,
            50,
            62,
            60
          ],
          "instruction": {
            "sv": "Prova på klaviaturen: spela tonerna som visas, från vänster till höger.",
            "en": "Try it on the keyboard: play the notes shown, from left to right."
          }
        },
        "staff": {
          "clef": "grand",
          "notes": [
            48,
            60,
            50,
            62,
            60
          ]
        }
      }
    ]
  }
];
export function getLesson(id:string):Lesson|undefined{return lessons.find(l=>l.id===id);}
/** Text-only placeholders: never interpret lesson content as HTML. */
export function formatLesson(text:string,opts:NamingOptions):string {
  const b=noteName(71,opts), bb=noteName(70,{...opts,accidental:'flat'});
  const replacements:Record<string,string>={B:b,Bb:bb,letters:`C D E F G A ${b}`,
    trebleMnemonic:opts.svNaming==='B'?'En Glad Björn Dansar Fint.':'En Glad Hund Dansar Fint.',
    bassMnemonic:opts.svNaming==='B'?'Glada Björnar Dansar För Alla.':'Glada Hundar Dansar För Alla.'};
  return text.replace(/\{(B|Bb|letters|trebleMnemonic|bassMnemonic)\}/g,(_,key:string)=>replacements[key]);
}
