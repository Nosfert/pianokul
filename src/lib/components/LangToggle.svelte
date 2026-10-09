<script lang="ts">
	import { LANG_FLAG, LANG_NAME, LANGS } from '$lib/core/lang';
	import { setUiLang, settings } from '$lib/stores/settings.svelte';
	import { t } from '$lib/stores/i18n.svelte';

	const current = $derived(settings.value.uiLang);
</script>

<div class="toggle" role="group" aria-label={t('app.uiLanguage')}>
	{#each LANGS as lang (lang)}
		<button
			class="lang"
			class:active={current === lang}
			aria-pressed={current === lang}
			lang={lang === 'sv' ? 'sv-SE' : 'en-GB'}
			onclick={() => setUiLang(lang)}
		>
			<span aria-hidden="true">{LANG_FLAG[lang]}</span>
			<span class="name">{LANG_NAME[lang]}</span>
		</button>
	{/each}
</div>

<style>
	.toggle {
		display: inline-flex;
		background: white;
		border: 3px solid var(--line);
		border-radius: 999px;
		padding: 3px;
	}
	.lang {
		font: inherit;
		font-weight: 700;
		border: none;
		background: transparent;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		min-height: 44px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.lang.active {
		background: var(--ink);
		color: white;
	}
	@media (max-width: 560px) {
		.name {
			display: none;
		}
	}
</style>
