<script lang="ts">
  import SkillPicker from '$lib/components/SkillPicker.svelte';
  import ExerciseRunner from '$lib/components/ExerciseRunner.svelte';
  import {refsFor,selectionId,skillLabel,type Selection} from '$lib/components/skillLabels';
  import {generateMixedRound} from '$lib/core/exercises/generate';
  import type {Exercise} from '$lib/core/exercises/types';
  import {randomSeed} from '$lib/core/rng';
  import type {RunResult} from '$lib/core/exercises/run';
  import {badgeLevelFor,type BadgeLevel} from '$lib/core/progress';
  import {progress} from '$lib/stores/progress.svelte';
  import {settings} from '$lib/stores/settings.svelte';
  import {fx} from '$lib/stores/fx.svelte';
  import {t} from '$lib/stores/i18n.svelte';
  import {href} from '$lib/nav';
  let selection=$state<Selection>({kind:'read-note',hand:settings.value.hand,level:1});
  let exercises=$state<Exercise[]>([]),running=$state(false),round=$state(0);
  let result=$state<RunResult|null>(null),earned=$state(0),badge=$state<BadgeLevel|null>(null);
  const existing=$derived(progress.state.badges[selectionId(selection)]);
  function start(){exercises=generateMixedRound(refsFor(selection),randomSeed(),10);result=null;earned=0;badge=null;round++;running=true;}
  function finish(r:RunResult){
    if(!running || result) return;
    const reward=progress.recordTest(selectionId(selection),r.score,r.total);
    result=r;earned=reward.stars;badge=badgeLevelFor(r.score,r.total);running=false;
    if(reward.badge && reward.upgraded)fx.celebrate(t('test.celebrate'),t('test.celebrateText'),reward.badge==='gold'?'🥇':'🥈');
    else if(reward.stars)fx.burst(reward.stars);
  }
</script>
<div class="stack">
  <h1>{t('test.title')}</h1><p class="lead">{t('test.intro')}</p>
  {#if running}
    <p>{skillLabel(selection,settings.value.uiLang)}</p>
    {#key round}<ExerciseRunner {exercises} mode="test" onDone={finish}/>{/key}
    <button class="btn ghost" type="button" onclick={()=>running=false}>{t('test.stop')}</button>
  {:else if result}
    <section class="card stack" aria-live="polite"><h2>{t('test.result')}</h2><p class="lead">{result.score} / {result.total}</p>
      <div class="row">{#each result.outcomes as o,i}<span class="pill" aria-label={`${i+1}: ${t(o.correct?'test.correct':'test.missed')}`}>{o.correct?'✓':'○'}</span>{/each}</div>
      <p>{badge==='gold'?'🥇':badge==='silver'?'🥈':'🌱'} {t(`test.${badge ?? 'none'}`)}</p><p>{t('exercise.earned',{count:earned})}</p>
      <div class="row"><button class="btn primary" type="button" onclick={start}>{t('test.again')}</button><button class="btn" type="button" onclick={()=>result=null}>{t('test.choose')}</button><a class="btn" href={href('/practice')}>{t('test.practice')}</a><a class="btn" href={href('/badges')}>{t('test.badges')}</a></div>
    </section>
  {:else}
    <SkillPicker value={selection} onChange={v=>selection=v} allowMix/>
    {#if existing}<p>{t('test.existing',{badge:t(`test.${existing.level}Name`)})}</p>{/if}
    <button class="btn primary" type="button" onclick={start}>{t('test.start')}</button>
  {/if}
</div>
