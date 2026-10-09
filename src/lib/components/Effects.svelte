<script lang="ts">
	import { tick } from 'svelte';
	import { fx } from '$lib/stores/fx.svelte';
	import { t } from '$lib/stores/i18n.svelte';
	import { settings } from '$lib/stores/settings.svelte';

	const pieces = ['⭐', '🎉', '✨', '🌟', '🎈', '💫'];
	const reduce = $derived(settings.value.reduceMotion);

	// Celebration overlay is a modal dialog: focus moves into it, Tab stays
	// inside, Escape closes it, and focus returns where it was (or to the
	// page content if that element is gone, e.g. a finished check round).
	let dialog = $state<HTMLDivElement | null>(null);
	let closeBtn = $state<HTMLButtonElement | null>(null);
	let returnTo: HTMLElement | null = null;
	const bigId = $derived(fx.big?.id ?? null);

	$effect(() => {
		if (bigId === null) return;
		const active = document.activeElement;
		if (active instanceof HTMLElement && active !== document.body && !dialog?.contains(active)) {
			returnTo = active;
		}
		void tick().then(() => closeBtn?.focus());
	});

	function close() {
		fx.closeBig();
		const target = returnTo;
		returnTo = null;
		void tick().then(() => {
			if (target && target.isConnected && !target.hasAttribute('disabled')) target.focus();
			else document.getElementById('main-content')?.focus();
		});
	}

	function onDialogKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			return;
		}
		if (e.key !== 'Tab' || !dialog) return;
		const items = [...dialog.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')];
		if (!items.length) return;
		const first = items[0]!;
		const last = items[items.length - 1]!;
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function confetti(n: number) {
		return Array.from({ length: n }, (_, i) => ({
			emoji: pieces[i % pieces.length],
			x: Math.round(Math.cos((i / n) * Math.PI * 2) * (80 + (i % 3) * 30)),
			y: Math.round(Math.sin((i / n) * Math.PI * 2) * (60 + (i % 4) * 25)),
			d: (i % 5) * 40
		}));
	}
</script>

<div class="fx-layer" aria-live="polite" class:reduce>
	{#each fx.bursts as b (b.id)}
		<div class="burst">
			{#if !reduce}
				{#each confetti(12) as c, i (i)}
					<span class="piece" style="--x:{c.x}px; --y:{c.y}px; animation-delay:{c.d}ms"
						>{c.emoji}</span
					>
				{/each}
			{/if}
			<span class="plus">{b.stars > 0 ? t('stars.earned', { count: b.stars }) : ''} {b.text ?? ''}</span>
		</div>
	{/each}
</div>

{#if fx.big}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<div
		class="overlay"
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="big-title"
		aria-describedby={fx.big.text ? 'big-text' : undefined}
		bind:this={dialog}
		onkeydown={onDialogKey}
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
	>
		<div class="big card pop-in">
			{#if !reduce}
				{#each confetti(20) as c, i (i)}
					<span class="piece big-piece" style="--x:{c.x * 1.8}px; --y:{c.y * 1.8}px; animation-delay:{c.d}ms"
						>{c.emoji}</span
					>
				{/each}
			{/if}
			<p class="trophy" aria-hidden="true">{fx.big.emoji}</p>
			<h2 id="big-title">{fx.big.title}</h2>
			{#if fx.big.text}<p class="lead" id="big-text">{fx.big.text}</p>{/if}
			<button class="btn primary big" bind:this={closeBtn} onclick={close}>{t('celebrate.close')}</button>
			<p class="esc">{t('celebrate.closeHelp')}</p>
		</div>
	</div>
{/if}

<style>
	.fx-layer {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 50;
		display: grid;
		place-items: center;
	}
	.burst {
		position: absolute;
		top: 40%;
		left: 50%;
	}
	.plus {
		position: absolute;
		transform: translate(-50%, -50%);
		font-size: 2.4rem;
		font-weight: 900;
		white-space: nowrap;
		color: var(--ink);
		text-shadow: 0 3px 0 #fff, 0 0 12px #fff;
		animation: float-up 1.6s ease-out forwards;
	}
	.piece {
		position: absolute;
		font-size: 1.8rem;
		transform: translate(-50%, -50%);
		animation: fly 1.2s ease-out forwards;
	}
	.big-piece {
		font-size: 2.4rem;
		animation-duration: 1.8s;
	}
	@keyframes fly {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(0.4);
		}
		100% {
			opacity: 0;
			transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.2) rotate(40deg);
		}
	}
	@keyframes float-up {
		0% {
			opacity: 0;
			transform: translate(-50%, -20%) scale(0.6);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.15);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -160%) scale(1);
		}
	}
	.reduce .plus {
		animation: none;
		opacity: 1;
	}
	.overlay {
		position: fixed;
		inset: 0;
		background: #2b225099;
		display: grid;
		place-items: center;
		z-index: 60;
		padding: 1rem;
	}
	.big {
		position: relative;
		text-align: center;
		max-width: 32rem;
	}
	.big h2 {
		overflow-wrap: anywhere;
	}
	.esc {
		margin: 0.6rem 0 0;
		font-size: 0.9rem;
		color: var(--muted);
	}
	.piece {
		pointer-events: none;
	}
	.trophy {
		font-size: 5rem;
		margin: 0;
		animation: bounce 1s ease-in-out infinite alternate;
	}
	@keyframes bounce {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-10px);
		}
	}
</style>
