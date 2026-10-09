<script lang="ts">
	import { href } from '$lib/nav';
	import { t } from '$lib/stores/i18n.svelte';
</script>

<section class="card center">
	<p class="emoji" aria-hidden="true">🎹❓</p>
	<h1>{t('app.notFound')}</h1>
	<p class="lead">{t('app.notFoundText')}</p>
	<a class="btn primary big" href={href('/')}>{t('app.toHome')}</a>
</section>

<style>
	.center {
		text-align: center;
		max-width: 36rem;
		margin: 2rem auto;
	}
	.emoji {
		font-size: 4rem;
		margin: 0;
	}
</style>
