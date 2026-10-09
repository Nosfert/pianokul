<script lang="ts">
 import {progress} from '$lib/stores/progress.svelte';
 import {settings} from '$lib/stores/settings.svelte';
 import {t} from '$lib/stores/i18n.svelte';
 import {LANG_LOCALE} from '$lib/core/lang';
 import {badgeLabel} from '$lib/components/skillLabels';
 import {href} from '$lib/nav';
 const badges=$derived(Object.values(progress.state.badges).sort((a,b)=>Number(b.level==='gold')-Number(a.level==='gold') || b.earned.localeCompare(a.earned) || a.skill.localeCompare(b.skill)));
 function date(day:string){const [y,m,d]=day.split('-').map(Number);return new Intl.DateTimeFormat(LANG_LOCALE[settings.value.uiLang],{dateStyle:'medium'}).format(new Date(y,m-1,d,12));}
</script>
<div class="stack"><h1>{t('badges.title')}</h1><p class="lead">{t('badges.intro')}</p>
 <div class="row"><span class="pill">⭐ {t('stars.count',{count:progress.stars})}</span><span class="pill">🔥 {t('streak.days',{count:progress.streak})}</span></div>
 {#if badges.length}<div class="grid">{#each badges as badge (badge.skill)}<article class="card stack"><h2>{badge.level==='gold'?'🥇':'🥈'} {t(`badges.${badge.level}`)}</h2><p>{badgeLabel(badge.skill,settings.value.uiLang)}</p><p>{t('badges.score',{score:badge.score,total:badge.total})}</p><p class="muted">{t('badges.earned',{date:date(badge.earned)})}</p></article>{/each}</div>
 {:else}<p class="card">{t('badges.empty')}</p>{/if}
 <section class="card stack"><h2>{t('badges.stats')}</h2><p>{t('badges.answered',{count:progress.totals.answered})}</p><p>{t('badges.correct',{count:progress.totals.correct})}</p><p>{t('badges.lessons',{count:progress.state.lessonsDone.length})}</p></section>
 <a class="btn primary" href={href('/test')}>{t('badges.test')}</a>
</div>
<style>.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:1rem;}</style>
