# Pianokul

Svenska: Lär dig hitta tangenterna, läsa noter i G- och F-klav och spela korta melodier med höger hand, vänster hand eller båda. Fem lektioner, övningar med tips, tester och märken gör det lätt att prova själv. Pianokul är gjort för dig som är ungefär 10–15 år. Byt mellan svenska och engelska i överkanten.

English: Learn your way around the keys, read treble and bass clefs, and play short melodies with your right hand, left hand or both. Five lessons, practice with hints, self-check tests and badges help you learn by playing. Pianokul is designed for ages 10–15. Switch between Swedish and English in the top bar.

## Run locally

Use Node 24+ and npm. Run these commands from this checkout, not a different worktree:

    npm ci
    npm run dev

Scripts:

    npm run check       TypeScript and Svelte diagnostics
    npm test            Pure-core and jsdom component tests
    npm run build       Static output in build/
    npm run preview     Preview the production build
    npm run preview:pages   Build and serve with Wrangler Pages locally
    npm run deploy      Build and upload a Cloudflare Pages deployment
    node scripts/verify.mjs   Clean install, all checks, tests, build and output checks

The verification script stops on errors. It does not repair them. No running dev server is used for automated verification. There is no backend, account or database.

## Cloudflare Pages

For Git integration, create a Pages project named `pianokul`, connect this repository and select the production branch you intend to release (usually `main`). Use build command `npm run build`, output directory `build`, root directory the repo root and `NODE_VERSION=24`. Do not use the Workers static-assets deployment flow: the Wrangler config uses `pages_build_output_dir`, not `[assets]`.

For direct upload, authenticate with `npx --yes wrangler@4 login` once, then run `npm run deploy`. The CLI may create a Pages project if it does not exist. Never store account tokens in the repository. A deployment from the plan-moe branch is a preview unless you deliberately select your production branch. Authentication and live deployment are manual release steps, not automated tests.

For a local Pages preview, run `npm run preview:pages`. The default Wrangler port is 8788; use `npx --yes wrangler@4 pages dev build --port 8789` if it is occupied. Open the address printed by Wrangler. `_headers` is copied into build/ and controls caching and basic response headers.

The app uses hash links such as `/#/learn/keyboard`, so refreshing a lesson loads the same static index.html. No `_redirects` file or Pages Functions are needed. Serve it at the domain root. Opening build/index.html with `file://` is not supported; use a web server.

## Learning and input

Five lessons cover keyboard patterns, note names, treble clef, bass clef and both hands/finger numbers. Practice has four skills and four levels. Hints appear after two wrong attempts; three wrong attempts reveal the current answer and allow you to move on. A ten-question test has no hints or visible key labels: 8/10 earns silver and 10/10 gold. A melody question counts as correct only when every note is correct.

Middle C is always C4 (MIDI 60). Swedish defaults to C D E F G A H, with an international B option in Settings. Traditional Swedish B is B-flat; the international option calls that Bess. English always uses B and B♭. A clef does not own a hand or a key: for example, either hand can play middle C. Exercises use the selected hand’s clef; both-hands exercises show the grand staff.

Use mouse/touch, or Tab to a piano key and press Space/Enter. Free play also supports physical computer keys A S D F G H J K L and the black-key row W E T Y U O P; Z/X change octave. The small keyboard letter tags describe computer keys, not note names. Optional MIDI is available only where the browser supports Web MIDI and the user grants permission. The on-screen keyboard always works without it.

### Real piano (microphone)

Put the iPad on the music stand and press "🎤 Listen to my piano" in a lesson, practice, test or free play. Each key heard on the real piano is checked like a tap on the screen. Settings → "Set up my piano" (`/#/mic`) calibrates once per piano/room: it measures room noise, then asks for C4, E4 and G4 (saying "wrong key" or "wrong octave" when needed) and stores the piano's tuning offset under `pianokul.mic.v1`.

Detection is monophonic (one key at a time) using the McLeod pitch method in the browser; no audio leaves the device. Echo cancellation/noise suppression are disabled because they smear piano tones, and the mic ignores the app's own synth while it sounds. Chords and very low notes are not reliable. The microphone requires HTTPS (or localhost): it works on the Cloudflare Pages deployment, not on `http://<lan-ip>:5173`. "Name the key" questions are answered on screen. Real-hardware accuracy has been tested with simulated piano audio only.

Sound uses a small Web Audio synthesizer, not recorded piano samples. Sound starts from user interaction; Settings can mute it. Motion respects both system reduced-motion preferences and the in-app toggle.

This is an introduction to pitch reading and key familiarity, not a replacement for a teacher. There is no rhythm/duration assessment or fingering detection. Play slowly on a real keyboard when learning hand technique. The app checks notes, not which physical hand or finger played them.

## Privacy and saved progress

Preferences and progress stay in this browser under `pianokul.settings.v1` and `pianokul.progress.v1`. There are no analytics, accounts, parent view or progress uploads. Another browser/device/site address starts fresh. Private browsing, storage restrictions or clearing site data may lose saved progress. Reset in Settings removes learning progress only, after confirmation; preferences remain.

## Architecture and final QA

SvelteKit 2, Svelte 5 runes, TypeScript, adapter-static and hash routing. Pure music/exercise/progress logic lives in src/lib/core/. Reactive localStorage stores live in src/lib/stores/. Every feature UI bundle has matching Swedish and English keys. Curriculum text is bilingual data in src/lib/content/lessons.ts. Components use real buttons, keyboard controls and localized accessible names.

After automated verification, the orchestrator must walk every route in both languages against a production preview started inside the implementation worktree on a free port. Check sound, note placement, key labels, practice hints, 7/10–8/10–10/10 tests, all lessons, reset cancellation, H/B naming, focus, narrow layouts and no console errors. Automated checks do not claim real-browser, audible-output, hardware-MIDI or live-Cloudflare verification.
