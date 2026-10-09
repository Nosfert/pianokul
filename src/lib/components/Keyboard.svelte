<script lang="ts" module>
	export type KeyHighlight = 'target' | 'correct' | 'wrong' | 'hint' | 'played';
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { getSynth } from '$lib/audio/synth';
	import { BLACK_HEIGHT, layoutKeys } from '$lib/core/music/keyboardLayout';
	import { MIDDLE_C, noteName, noteNameWithOctave, octave, pitchClass } from '$lib/core/music/notes';
	import { t } from '$lib/stores/i18n.svelte';
	import { naming, settings } from '$lib/stores/settings.svelte';

	let {
		lo,
		hi,
		labels,
		highlight = {},
		pressed = [],
		computerLabels = {},
		disabled = false,
		showMiddleC = true,
		sound,
		onNoteOn,
		onNoteOff
	}: {
		/** Inclusive MIDI range; widened so the keyboard starts and ends on a white key. */
		lo: number;
		hi: number;
		/** Note names on keys. Default follows the keyLabels setting ('white' or 'none'). */
		labels?: 'none' | 'white' | 'all';
		highlight?: Record<number, KeyHighlight>;
		/** Notes held from outside (computer keyboard, MIDI): shown as pressed. */
		pressed?: number[];
		/** midi → computer key letter, shown as a small tag on the key. */
		computerLabels?: Record<number, string>;
		disabled?: boolean;
		showMiddleC?: boolean;
		/** Play through the synth on press. Default follows the sound setting. */
		sound?: boolean;
		onNoteOn?: (midi: number) => void;
		onNoteOff?: (midi: number) => void;
	} = $props();

	const layout = $derived(layoutKeys(lo, hi));
	const labelMode = $derived(labels ?? (settings.value.keyLabels ? 'white' : 'none'));
	const soundOn = $derived(sound ?? settings.value.sound);

	/** Keys currently held by a pointer or the Space key on this component (midi → pointerId; -1 = keyboard). */
	let held = $state<Record<number, number>>({});
	const isDown = $derived((midi: number) => midi in held || pressed.includes(midi));

	function start(midi: number, pointerId: number) {
		if (disabled || midi in held) return;
		held = { ...held, [midi]: pointerId };
		if (soundOn) {
			const s = getSynth();
			void s.resume();
			s.noteOn(midi);
		}
		onNoteOn?.(midi);
	}

	function stop(midi: number) {
		if (!(midi in held)) return;
		const next = { ...held };
		delete next[midi];
		held = next;
		getSynth().noteOff(midi);
		onNoteOff?.(midi);
	}

	function stopPointer(pointerId: number) {
		for (const [m, id] of Object.entries(held)) if (id === pointerId) stop(Number(m));
	}

	function stopAll() {
		for (const m of Object.keys(held)) stop(Number(m));
	}

	onDestroy(stopAll);

	function onPointerDown(e: PointerEvent, midi: number) {
		if (e.button !== 0 && e.pointerType === 'mouse') return;
		e.preventDefault();
		// Release the implicit capture so pointerenter fires on neighbouring keys (glissando).
		(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
		start(midi, e.pointerId);
	}

	/** Glissando: a pointer that is already down slides onto a new key. */
	function onPointerEnter(e: PointerEvent, midi: number) {
		if (e.buttons === 0) return;
		if (!Object.values(held).includes(e.pointerId)) return;
		stopPointer(e.pointerId);
		start(midi, e.pointerId);
	}

	function onKeyDown(e: KeyboardEvent, midi: number) {
		if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
		e.preventDefault();
		start(midi, -1);
	}

	function onKeyUp(e: KeyboardEvent, midi: number) {
		if (e.key !== ' ' && e.key !== 'Enter') return;
		stopPointer(-1);
	}

	function label(midi: number, black: boolean): string {
		if (labelMode === 'none') return '';
		if (black && labelMode !== 'all') return '';
		const name = noteName(midi, naming());
		return pitchClass(midi) === 0 ? `${name}${octave(midi)}` : name;
	}
</script>

<svelte:window onpointerup={(e) => stopPointer(e.pointerId)} onpointercancel={(e) => stopPointer(e.pointerId)} onblur={stopAll} />

<div class="keyboard-wrap">
	<div
		class="keyboard"
		role="group"
		aria-label={t('keyboard.label')}
		style="--white-count: {layout.whiteCount}; --black-height: {BLACK_HEIGHT * 100}%"
	>
		{#each layout.keys as k (k.midi)}
			<button
				type="button"
				class="key"
				class:black={k.black}
				class:white={!k.black}
				class:down={isDown(k.midi)}
				class:is-target={highlight[k.midi] === 'target'}
				class:is-correct={highlight[k.midi] === 'correct'}
				class:is-wrong={highlight[k.midi] === 'wrong'}
				class:is-hint={highlight[k.midi] === 'hint'}
				class:is-played={highlight[k.midi] === 'played'}
				style="--x: {k.x}; --w: {k.w}"
				data-midi={k.midi}
				aria-label={t('keyboard.key', { name: noteNameWithOctave(k.midi, naming()) })}
				aria-pressed={isDown(k.midi)}
				{disabled}
				onpointerdown={(e) => onPointerDown(e, k.midi)}
				onpointerenter={(e) => onPointerEnter(e, k.midi)}
				onkeydown={(e) => onKeyDown(e, k.midi)}
				onkeyup={(e) => onKeyUp(e, k.midi)}
				onblur={() => { if (held[k.midi] === -1) stop(k.midi); }}
				oncontextmenu={(e) => e.preventDefault()}
			>
				{#if highlight[k.midi] === 'correct'}<span class="mark" aria-hidden="true">✓</span>{/if}
				{#if highlight[k.midi] === 'wrong'}<span class="mark" aria-hidden="true">✗</span>{/if}
				{#if computerLabels[k.midi]}<span class="ckey" aria-hidden="true">{computerLabels[k.midi]}</span>{/if}
				{#if label(k.midi, k.black)}<span class="name" aria-hidden="true">{label(k.midi, k.black)}</span>{/if}
				{#if showMiddleC && k.midi === MIDDLE_C}<span class="dot" title={t('keyboard.middleC')}></span>{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.keyboard-wrap {
		container-type: inline-size;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 0.25rem 0 0.5rem;
		-webkit-overflow-scrolling: touch;
	}
	.keyboard {
		position: relative;
		/* Each white key is at least 44px wide (touch target); the keyboard scrolls sideways if it does not fit. */
		--white-w: max(44px, min(72px, calc((100cqw - 8px) / var(--white-count))));
		width: calc(var(--white-w) * var(--white-count));
		height: calc(var(--white-w) * 3.4);
		min-height: 150px;
		margin: 0 auto;
		user-select: none;
		touch-action: none;
	}
	.key {
		position: absolute;
		top: 0;
		left: calc(var(--x) * var(--white-w));
		width: calc(var(--w) * var(--white-w));
		margin: 0;
		padding: 0 0 0.35rem;
		font: inherit;
		font-weight: 800;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 2px;
		cursor: pointer;
		touch-action: none;
		transition:
			background-color 0.08s,
			transform 0.08s;
	}
	.white {
		height: 100%;
		background: var(--white-key, #fffdf7);
		color: var(--ink, #2b2250);
		border: 3px solid var(--ink, #2b2250);
		border-radius: 0 0 10px 10px;
		z-index: 1;
	}
	.black {
		height: var(--black-height);
		background: var(--black-key, #2b2250);
		color: #fff;
		border: 3px solid var(--ink, #2b2250);
		border-top: none;
		border-radius: 0 0 8px 8px;
		z-index: 2;
		font-size: 0.75rem;
		box-shadow: 0 4px 0 #0005;
	}
	.key.down {
		transform: translateY(2px);
	}
	.white.down {
		background: var(--key-down, #e6e0ff);
	}
	.black.down {
		background: #4a3f7a;
	}
	.is-target {
		box-shadow: inset 0 0 0 4px var(--accent, #5b3df5);
	}
	.is-hint {
		outline: 4px dashed var(--accent, #5b3df5);
		outline-offset: -6px;
	}
	.is-correct {
		background: var(--good, #3cc15a) !important;
		color: #fff;
	}
	.is-wrong {
		background: var(--try-bg, #ffd3b3) !important;
	}
	.is-played {
		background: var(--key-down, #e6e0ff);
	}
	.mark {
		font-size: 1.3rem;
		line-height: 1;
	}
	.name {
		font-size: 0.85rem;
	}
	.ckey {
		font-size: 0.7rem;
		opacity: 0.7;
		border: 1px solid currentColor;
		border-radius: 4px;
		padding: 0 4px;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent, #5b3df5);
		margin-top: 2px;
	}
	.key:disabled {
		cursor: default;
		opacity: 0.6;
	}
	.key:focus-visible {
		outline: 4px solid var(--focus, #7a4fd6);
		outline-offset: -4px;
		z-index: 3;
	}
	:global(html.reduce-motion) .key {
		transition: none;
	}
</style>
