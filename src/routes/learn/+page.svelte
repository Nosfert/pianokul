<script lang="ts">
 import {lessons} from '$lib/content/lessons';
 import {settings} from '$lib/stores/settings.svelte';
 import {progress} from '$lib/stores/progress.svelte';
 import {t} from '$lib/stores/i18n.svelte';
 import {href} from '$lib/nav';
</script>
<div class="stack"><h1>{t('learn.title')}</h1><p class="lead">{t('learn.intro')}</p>
 {#each lessons as lesson,i}<article class="card stack"><h2>{i+1}. {lesson.title[settings.value.uiLang]}</h2><p>{lesson.intro[settings.value.uiLang]}</p>
  {#if progress.isLessonDone(lesson.id)}<p>✓ {t('learn.done')}</p>{/if}
  <a class="btn primary" href={href(`/learn/${lesson.id}`)}>{t('learn.open')}<span class="sr-only">: {lesson.title[settings.value.uiLang]}</span></a>
 </article>{/each}
</div>
