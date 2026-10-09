<script lang="ts">
	import { href } from '$lib/nav';
	import { t } from '$lib/stores/i18n.svelte';

	/** Stars + streak pill linking to the badges page. Values come from the caller. */
	let { stars = 0, streak = 0 }: { stars?: number; streak?: number } = $props();
</script>

<a class="badges" href={href('/badges')} title={t('stars.seeBadges')}>
	<span class="badge stars">
		<span aria-hidden="true">⭐</span>
		<span class="sr-only">{t('stars.count', { count: stars })},</span>
		<span aria-hidden="true">{stars}</span>
	</span>
	{#if streak > 0}
		<span class="badge streak">
			<span aria-hidden="true">🔥</span>
			<span class="sr-only">{t('streak.days', { count: streak })}</span>
			<span aria-hidden="true">{streak}</span>
		</span>
	{/if}
	<span class="sr-only">– {t('stars.seeBadges')}</span>
</a>

<style>
	.badges {
		display: inline-flex;
		gap: 0.5rem;
		color: var(--ink);
		text-decoration: none;
		border-radius: 999px;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-weight: 800;
		font-size: 1.2rem;
		background: white;
		border: 3px solid var(--line);
		border-radius: 999px;
		padding: 0.25rem 0.8rem;
		min-height: 44px;
	}
	.stars {
		border-color: #f2c200;
	}
	.streak {
		border-color: #ff7a59;
	}
</style>
