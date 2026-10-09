<script lang="ts">
	import { onDestroy } from 'svelte';
	import Keyboard, { type KeyHighlight } from '$lib/components/Keyboard.svelte';
	import { MIDDLE_C, noteNameWithOctave } from '$lib/core/music/notes';
	import { href } from '$lib/nav';
	import { t } from '$lib/stores/i18n.svelte';
	import { mic, micCalibration } from '$lib/stores/mic.svelte';
	import { naming } from '$lib/stores/settings.svelte';

	let phase = $state<'intro' | 'running' | 'done'>('intro');
	let tryNotes = $state<number[]>([]);

	// Re-read the calibrator whenever it reports a visible change (calTick).
	const view = $derived.by(() => {
		void mic.calTick;
		const c = mic.calibrator;
		return c ? { phase: c.phase, index: c.index, target: c.target, feedback: c.feedback, total: c.targets.length, quiet: c.quietProgress } : null;
	});

	$effect(() => {
		if (phase === 'running' && view?.phase === 'done') {
			mic.finishCalibration();
			phase = 'done';
		}
	});

	const off = mic.onMicNote((midi) => {
		if (phase === 'done') tryNotes = [...tryNotes, midi].slice(-6);
	});
	onDestroy(() => {
		off();
		if (mic.calibrator) mic.cancelCalibration();
	});

	async function begin() {
		if (!(await mic.start())) return;
		tryNotes = [];
		mic.beginCalibration();
		phase = 'running';
	}

	function cancel() {
		mic.cancelCalibration();
		phase = 'intro';
	}

	const highlight = $derived.by(() => {
		const h: Record<number, KeyHighlight> = {};
		if (phase === 'running' && view?.phase === 'note') {
			h[view.target] = 'target';
			const fb = view.feedback;
			if (fb && fb.kind !== 'ok' && fb.heard !== view.target) h[fb.heard] = 'wrong';
		}
		if (phase === 'done') for (const m of tryNotes.slice(-1)) h[m] = 'played';
		return h;
	});
	const error = $derived(mic.status === 'unsupported' || mic.status === 'denied' || mic.status === 'failed' ? mic.status : null);
</script>

<div class="stack">
	<h1>{t('mic.title')}</h1>
	<p class="lead">{t('mic.intro')}</p>
	<section class="card stack">
		{#if phase === 'intro'}
			<p>{t('mic.tip')}</p>
			<div class="row">
				<button class="btn primary big" type="button" disabled={mic.status === 'starting'} onclick={begin}>{mic.status === 'starting' ? t('mic.starting') : t('mic.start')}</button>
			</div>
			{#if micCalibration.value.at}<p class="muted">{t('mic.tuning', { cents: micCalibration.value.tuningCents })}</p>{/if}
		{:else if phase === 'running' && view}
			{#if view.phase === 'quiet'}
				<p class="lead" role="status">{t('mic.quiet')}</p>
				<progress max="1" value={view.quiet}></progress>
			{:else}
				<p class="pill">{t('mic.step', { n: view.index + 1, total: view.total })}</p>
				<h2>{t('mic.playThis', { name: noteNameWithOctave(view.target, naming()) })}</h2>
				<p>{t('mic.playHelp')}</p>
				{#if view.target === MIDDLE_C}<p class="muted">{t('mic.middleC')}</p>{/if}
				<div aria-live="polite">
					{#if view.feedback?.kind === 'ok'}<p class="good">{t('mic.ok', { name: noteNameWithOctave(view.feedback.heard, naming()) })}</p>
					{:else if view.feedback?.kind === 'octave'}<p class="try">{t('mic.octave')}</p>
					{:else if view.feedback?.kind === 'wrong'}<p class="try">{t('mic.wrong', { name: noteNameWithOctave(view.feedback.heard, naming()) })}</p>{/if}
				</div>
			{/if}
			<span class="meter" role="meter" aria-label={t('mic.level')} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(mic.level * 100)}><span class="fill" style="width: {Math.round(mic.level * 100)}%"></span></span>
			<Keyboard lo={48} hi={71} labels="white" {highlight} sound={false} />
			<button class="btn ghost" type="button" onclick={cancel}>{t('mic.cancel')}</button>
		{:else if phase === 'done'}
			<h2 role="status">{t('mic.done')}</h2>
			<p class="muted">{t('mic.tuning', { cents: micCalibration.value.tuningCents })}</p>
			<p>{t('mic.tryIt')}</p>
			<p class="lead" aria-live="polite">{tryNotes.length ? tryNotes.map((m) => noteNameWithOctave(m, naming())).join(' · ') : '…'}</p>
			<Keyboard lo={48} hi={71} labels="white" {highlight} sound={false} />
			<div class="row">
				<a class="btn primary" href={href('/practice')}>{t('mic.finish')}</a>
				<button class="btn" type="button" onclick={begin}>{t('mic.recalibrate')}</button>
			</div>
		{/if}
		{#if error}<p role="status">{t(`mic.${error}`)}</p>{/if}
	</section>
	<a class="btn" href={href('/settings')}>{t('mic.back')}</a>
</div>

<style>
	progress {
		width: 100%;
		height: 1rem;
		accent-color: var(--accent);
	}
	.meter {
		display: block;
		width: 100%;
		max-width: 16rem;
		height: 0.8rem;
		border-radius: 1rem;
		background: white;
		border: 2px solid var(--line);
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--good);
		transition: width 60ms linear;
	}
	.good {
		color: var(--good-dark);
		font-weight: 800;
	}
	.try {
		color: var(--try);
		font-weight: 800;
	}
</style>
