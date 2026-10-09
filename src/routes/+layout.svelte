<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Effects from '$lib/components/Effects.svelte';
	import LangToggle from '$lib/components/LangToggle.svelte';
	import StarsBadge from '$lib/components/StarsBadge.svelte';
	import { LANG_LOCALE } from '$lib/core/lang';
	import { href } from '$lib/nav';
	import { t } from '$lib/stores/i18n.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { progress } from '$lib/stores/progress.svelte';

	let { children } = $props();

	const isHome = $derived(page.route.id === '/');
	let mainEl = $state<HTMLElement | null>(null);

	$effect(() => {
		const html = document.documentElement;
		html.lang = LANG_LOCALE[settings.value.uiLang];
		html.classList.toggle('reduce-motion', settings.value.reduceMotion);
		document.title = t('app.name');
	});

	/** Focus the page's main heading (or <main>) so keyboard / screen-reader users start at the content. */
	function focusContent() {
		const target = mainEl?.querySelector<HTMLElement>('h1') ?? mainEl;
		if (!target) return;
		if (target !== mainEl && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		target.focus({ preventScroll: true });
	}

	afterNavigate((nav) => {
		if (nav.type === 'enter') return;
		const active = document.activeElement;
		if (active && active !== document.body && active !== document.documentElement) return;
		focusContent();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Hash routing: an in-page "#main-content" link would be read as a route, so the skip link is a button. -->
<button type="button" class="skip-link" onclick={focusContent}>{t('app.skipToContent')}</button>

<header class="topbar">
	<div class="left">
		{#if !isHome}
			<a class="btn home" href={href('/')}>
				<span aria-hidden="true">🏠</span> <span class="label">{t('app.home')}</span>
				<span class="sr-only short">{t('app.home')}</span>
			</a>
		{:else}
			<span class="logo"><span aria-hidden="true">🎹</span> {t('app.name')}</span>
		{/if}
	</div>
	<div class="right">
		<StarsBadge stars={progress.stars} streak={progress.streak} />
		<LangToggle />
	</div>
</header>

<main id="main-content" tabindex="-1" bind:this={mainEl}>
	{@render children()}
</main>

<footer>
	<nav aria-label={t('app.mainNav')}>
		<a href={href('/badges')} aria-current={page.route.id === '/badges' ? 'page' : undefined}
			><span aria-hidden="true">🏅</span> {t('app.badges')}</a
		>
		<a href={href('/settings')} aria-current={page.route.id === '/settings' ? 'page' : undefined}
			><span aria-hidden="true">⚙️</span> {t('app.settings')}</a
		>
	</nav>
</footer>

<Effects />

<style>
	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		padding: 0.8rem clamp(0.8rem, 3vw, 2rem);
	}
	.right {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		flex-wrap: wrap;
	}
	.logo {
		font-size: 1.5rem;
		font-weight: 900;
	}
	.home {
		min-height: 48px;
	}
	.short {
		display: none;
	}
	main {
		padding: 0 clamp(0.8rem, 3vw, 2rem) 2rem;
		max-width: 72rem;
		margin: 0 auto;
	}
	main:focus {
		outline: none;
	}
	footer nav {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		padding: 1rem 1rem 2rem;
		font-weight: 700;
	}
	footer a {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.6rem 0.4rem;
		min-height: 44px;
	}
	footer a[aria-current='page'] {
		text-decoration-thickness: 3px;
	}
	@media (max-width: 560px) {
		.label {
			display: none;
		}
		.short {
			display: inline;
		}
	}
</style>
