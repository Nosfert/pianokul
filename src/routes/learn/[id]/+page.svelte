<script lang="ts">
 import {page} from '$app/state';
 import {getLesson} from '$lib/content/lessons';
 import LessonView from '$lib/components/LessonView.svelte';
 import {t} from '$lib/stores/i18n.svelte';
 import {href} from '$lib/nav';
 const lesson=$derived(getLesson(page.params.id ?? ''));
</script>
{#if lesson}{#key lesson.id}<LessonView {lesson}/>{/key}
{:else}<section class="card stack"><h1>{t('learn.missing')}</h1><a class="btn" href={href('/learn')}>{t('learn.all')}</a></section>{/if}
