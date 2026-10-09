<script lang="ts" module>
	export type StaffNoteState = 'normal' | 'current' | 'correct' | 'wrong' | 'hint';
	export interface StaffNote {
		midi: number;
		accidental?: 'sharp' | 'flat';
		state?: StaffNoteState;
	}
</script>

<script lang="ts">
	import { clefFor, noteNameWithOctave, type Clef } from '$lib/core/music/notes';
	import { placeNote, positionToY, STAFF_LINE_POSITIONS } from '$lib/core/music/staff';
	import { t } from '$lib/stores/i18n.svelte';
	import { naming } from '$lib/stores/settings.svelte';

	let {
		clef,
		notes = [],
		showNames = false,
		showStems = true,
		lineGap = 12,
		compact = false,
		label
	}: {
		clef: Clef | 'grand';
		notes?: StaffNote[];
		/** Note name under each note. */
		showNames?: boolean;
		showStems?: boolean;
		/** Distance between staff lines in viewBox px. */
		lineGap?: number;
		/** Less horizontal space, for small inline examples. */
		compact?: boolean;
		/** aria-label override. */
		label?: string;
	} = $props();

	// Geometry (viewBox px). Positions: 0 = bottom line, 8 = top line.
	// Each staff reserves room for 4 ledger lines above and below.
	const EXTRA = $derived(lineGap * 4);
	const staffHeight = $derived(lineGap * 4 + 2 * EXTRA);
	const height = $derived(clef === 'grand' ? staffHeight * 2 : staffHeight);
	const clefWidth = $derived(lineGap * 4);
	const leftPad = $derived(compact ? lineGap : lineGap * 2);
	const noteSpacing = $derived(compact ? lineGap * 3 : lineGap * 4);
	const width = $derived(leftPad + clefWidth + Math.max(notes.length, 1) * noteSpacing + lineGap * 2);

	const staves = $derived(clef === 'grand' ? (['treble', 'bass'] as Clef[]) : [clef]);
	/** y of the bottom line of staff i (0 = top staff). */
	const bottomLineY = $derived((i: number) => EXTRA + lineGap * 4 + i * staffHeight);

	const placed = $derived(
		notes.map((n, i) => {
			const c: Clef = clef === 'grand' ? clefFor(n.midi) : clef;
			const p = placeNote(n.midi, c, n.accidental);
			const by = bottomLineY(staves.indexOf(c));
			return {
				...n,
				i,
				clef: c,
				x: leftPad + clefWidth + i * noteSpacing + noteSpacing / 2,
				y: positionToY(p.position, lineGap, by),
				ledger: p.ledgerLines.map((pos) => positionToY(pos, lineGap, by)),
				stem: p.stem,
				accidental: p.accidental,
				name: noteNameWithOctave(n.midi, { ...naming(), accidental: n.accidental })
			};
		})
	);

	const noteList = $derived(placed.map((p) => p.name).join(', '));
	const aria = $derived(label ?? (notes.length ? t('staff.notes', { list: noteList }) : t('staff.empty')));
	const headRx = $derived(lineGap * 0.62);
	const headRy = $derived(lineGap * 0.45);
	const stemLen = $derived(lineGap * 3.5);
</script>

<svg class="staff" viewBox="0 0 {width} {height}" role="img" aria-label={aria} style="max-width: {width * 1.5}px" data-notes={notes.length}>
	<title>{aria}</title>
	{#each staves as s, i (s)}
		{@const by = bottomLineY(i)}
		<g class="lines">
			{#each STAFF_LINE_POSITIONS as pos (pos)}
				<line x1={leftPad} x2={width - lineGap} y1={positionToY(pos, lineGap, by)} y2={positionToY(pos, lineGap, by)} />
			{/each}
		</g>
		{#if s === 'treble'}
			<!-- G clef: the curl sits on the G line (position 2). Simplified path in a 10px-line-gap grid, bottom line at y=0. -->
			<g class="clef" transform="translate({leftPad + lineGap * 0.4}, {by}) scale({lineGap / 10})" data-clef="treble">
				<path
					fill="none"
					stroke-width="2.6"
					stroke-linecap="round"
					d="M 14 -10 C 14 -18 26 -20 26 -12 C 26 -3 12 0 8 -10 C 4 -22 22 -30 23 -44 C 24 -54 20 -60 17 -56 C 14 -52 16 -40 17 -24 L 19 12 C 19 19 10 20 9 14"
				/>
			</g>
		{:else}
			<!-- F clef: two dots around the F line (position 6). -->
			<g class="clef" transform="translate({leftPad + lineGap * 0.4}, {by}) scale({lineGap / 10})" data-clef="bass">
				<path d="M 10 -30 C 10 -38 22 -40 22 -30 C 22 -20 14 -10 6 -4 C 16 -8 26 -18 26 -30 C 26 -42 10 -44 10 -30 Z" />
				<circle cx="10" cy="-30" r="3" />
				<circle cx="31" cy="-35" r="1.8" />
				<circle cx="31" cy="-25" r="1.8" />
			</g>
		{/if}
	{/each}
	{#if clef === 'grand'}
		<line class="brace-line" x1={leftPad} x2={leftPad} y1={positionToY(8, lineGap, bottomLineY(0))} y2={bottomLineY(1)} />
		<path
			class="brace"
			fill="none"
			d="M {leftPad - lineGap * 0.4} {positionToY(8, lineGap, bottomLineY(0))} Q {leftPad - lineGap * 1.6} {(positionToY(8, lineGap, bottomLineY(0)) + bottomLineY(1)) / 2} {leftPad - lineGap * 0.4} {bottomLineY(1)}"
		/>
	{/if}
	{#each placed as n (n.i)}
		<g class="note state-{n.state ?? 'normal'}" data-midi={n.midi} data-position-y={n.y}>
			{#each n.ledger as ly (ly)}
				<line class="ledger" x1={n.x - headRx * 1.7} x2={n.x + headRx * 1.7} y1={ly} y2={ly} />
			{/each}
			{#if n.accidental}
				<text class="accidental" x={n.x - headRx * 1.9} y={n.y + lineGap * 0.4} text-anchor="end" font-size={lineGap * 1.6}>{n.accidental}</text>
			{/if}
			{#if n.state === 'current' || n.state === 'hint'}
				<circle class="ring" cx={n.x} cy={n.y} r={headRx * 1.9} />
			{/if}
			<ellipse class="head" cx={n.x} cy={n.y} rx={headRx} ry={headRy} transform="rotate(-20 {n.x} {n.y})" />
			{#if showStems}
				{#if n.stem === 'up'}
					<line class="stem" x1={n.x + headRx - 0.6} x2={n.x + headRx - 0.6} y1={n.y} y2={n.y - stemLen} />
				{:else}
					<line class="stem" x1={n.x - headRx + 0.6} x2={n.x - headRx + 0.6} y1={n.y} y2={n.y + stemLen} />
				{/if}
			{/if}
			{#if n.state === 'correct'}
				<text class="mark" x={n.x} y={n.y - lineGap * 2.6} text-anchor="middle" font-size={lineGap * 1.4}>✓</text>
			{:else if n.state === 'wrong'}
				<text class="mark" x={n.x} y={n.y - lineGap * 2.6} text-anchor="middle" font-size={lineGap * 1.4}>✗</text>
			{/if}
			{#if showNames}
				<text class="name" x={n.x} y={height - lineGap * 0.6} text-anchor="middle" font-size={lineGap * 1.1}>{n.name}</text>
			{/if}
		</g>
	{/each}
</svg>

<style>
	.staff {
		display: block;
		width: 100%;
		height: auto;
		color: var(--ink, #2b2250);
		overflow: visible;
	}
	.lines line,
	.ledger,
	.stem,
	.brace-line {
		stroke: currentColor;
		stroke-width: 1.2;
	}
	.ledger {
		stroke-width: 1.5;
	}
	.stem {
		stroke-width: 1.6;
	}
	.brace {
		stroke: currentColor;
		stroke-width: 2.5;
	}
	.clef path,
	.clef circle {
		fill: currentColor;
		stroke: currentColor;
	}
	.clef path[fill='none'] {
		fill: none;
	}
	.head {
		fill: currentColor;
	}
	.accidental,
	.name,
	.mark {
		fill: currentColor;
		font-weight: 800;
		font-family: inherit;
	}
	.ring {
		fill: none;
		stroke: var(--accent, #5b3df5);
		stroke-width: 2.5;
	}
	.state-hint .ring {
		stroke-dasharray: 4 3;
	}
	.state-current .head {
		fill: var(--accent, #5b3df5);
	}
	.state-correct .head,
	.state-correct .mark {
		fill: var(--good-dark, #1f7a34);
	}
	.state-wrong .head,
	.state-wrong .mark {
		fill: var(--try, #9a4d0c);
	}
</style>
