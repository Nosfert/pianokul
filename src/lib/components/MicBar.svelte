<script lang="ts">
	import { onDestroy } from 'svelte';
	import { noteNameWithOctave } from '$lib/core/music/notes';
	import { href } from '$lib/nav';
	import { t } from '$lib/stores/i18n.svelte';
	import { mic, micCalibration } from '$lib/stores/mic.svelte';
	import { naming } from '$lib/stores/settings.svelte';

	/** Called for every key heard on the real piano while this bar is mounted. */
	let { onNote, disabled = false }: { onNote?: (midi: number) => void; disabled?: boolean } = $props();

	const off = mic.onMicNote((midi) => {
		if (!disabled) onNote?.(midi);
	});
	onDestroy(off);

	const error = $derived(mic.status === 'unsupported' || mic.status === 'denied' || mic.status === 'failed' ? mic.status : null);
</script>

{#if mic.supported || error}
	<div class="micbar" class:live={mic.on}>
		<button
			type="button"
			class="btn"
			class:accent={mic.on}
			aria-pressed={mic.on}
			disabled={mic.status === 'starting'}
			onclick={() => mic.toggle()}
		>
			{mic.status === 'starting' ? t('mic.starting') : mic.on ? t('mic.toggleOff') : t('mic.toggleOn')}
		</button>
		{#if mic.on}
			<span class="meter" role="meter" aria-label={t('mic.level')} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(mic.level * 100)}>
				<span class="fill" style="width: {Math.round(mic.level * 100)}%"></span>
			</span>
			<span class="heard" aria-live="polite">
				{#key mic.beat}<span class="pop">{mic.heard === null ? t('mic.listening') : t('mic.heard', { name: noteNameWithOctave(mic.heard, naming()) })}</span>{/key}
			</span>
		{/if}
		<a class="cal" href={href('/mic')}>{micCalibration.value.at ? t('mic.recalibrate') : t('mic.calibrate')}</a>
		{#if mic.on && !micCalibration.value.at}<p class="muted note">{t('mic.notCalibrated')}</p>{/if}
		{#if error}<p class="note" role="status">{t(`mic.${error}`)}</p>{/if}
	</div>
{/if}

<style>
	.micbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		padding: 0.6rem 0.8rem;
		border: 2px dashed var(--line);
		border-radius: 16px;
	}
	.micbar.live {
		border-style: solid;
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.meter {
		display: inline-block;
		width: 6rem;
		height: 0.7rem;
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
	.heard {
		font-weight: 800;
	}
	.pop {
		display: inline-block;
		animation: pop 250ms ease-out;
	}
	.cal {
		font-weight: 700;
	}
	.note {
		flex-basis: 100%;
		margin: 0;
	}
	@keyframes pop {
		from {
			transform: scale(1.25);
		}
		to {
			transform: scale(1);
		}
	}
	:global(.reduce-motion) .pop {
		animation: none;
	}
</style>
