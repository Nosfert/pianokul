<script lang="ts">
	import { href } from '$lib/nav';
	import { t } from '$lib/stores/i18n.svelte';

	const tiles = [
		{ path: '/learn', emoji: '📖', title: 'home.learn', sub: 'home.learnSub', color: '#d9f0ff' },
		{ path: '/practice', emoji: '🎯', title: 'home.practice', sub: 'home.practiceSub', color: '#ffe9b3' },
		{ path: '/test', emoji: '🏆', title: 'home.test', sub: 'home.testSub', color: '#ffd3e0' },
		{ path: '/play', emoji: '🎹', title: 'home.play', sub: 'home.playSub', color: '#d8f5dc' }
	];
</script>

<section class="hello">
	<h1>{t('app.greeting')}</h1>
	<p class="lead">{t('app.tagline')}</p>
</section>

<nav class="tiles" aria-label={t('app.sections')}>
	{#each tiles as tile (tile.path)}
		<a class="tile" href={href(tile.path)} style="--tile: {tile.color}">
			<span class="emoji" aria-hidden="true">{tile.emoji}</span>
			<span class="title">{t(tile.title)}</span>
			<span class="subtitle">{t(tile.sub)}</span>
		</a>
	{/each}
</nav>

<style>
	.hello {
		text-align: center;
		margin: 0.5rem 0 1.5rem;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: 1rem;
	}
	.tile {
		display: grid;
		gap: 0.3rem;
		justify-items: center;
		text-align: center;
		text-decoration: none;
		background: var(--tile);
		border: 4px solid var(--line);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		padding: 1.4rem 1rem;
		min-height: 11rem;
		transition: transform 0.1s;
	}
	.tile:hover {
		transform: translateY(-3px);
	}
	.emoji {
		font-size: 3rem;
		line-height: 1;
	}
	.title {
		font-size: 1.5rem;
		font-weight: 900;
	}
	.subtitle {
		color: var(--muted);
		font-weight: 700;
	}
</style>
