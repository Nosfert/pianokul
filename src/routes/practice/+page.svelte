<script lang="ts">
  import SkillPicker from '$lib/components/SkillPicker.svelte';
  import ExerciseRunner from '$lib/components/ExerciseRunner.svelte';
  import {refsFor,skillLabel,type Selection} from '$lib/components/skillLabels';
  import {generateMixedRound} from '$lib/core/exercises/generate';
  import {skillId,type Exercise} from '$lib/core/exercises/types';
  import {randomSeed} from '$lib/core/rng';
  import type {RunResult} from '$lib/core/exercises/run';
  import {progress} from '$lib/stores/progress.svelte';
  import {settings} from '$lib/stores/settings.svelte';
  import {fx} from '$lib/stores/fx.svelte';
  import {t} from '$lib/stores/i18n.svelte';
  import {href} from '$lib/nav';
  let selection=$state<Selection>({kind:'read-note',hand:settings.value.hand,level:1});
  let exercises=$state<Exercise[]>([]), running=$state(false), round=$state(0);
  let result=$state<RunResult|null>(null), earned=$state(0), stopped=$state(false);
  function start() {exercises=generateMixedRound(refsFor(selection),randomSeed(),10);result=null;earned=0;stopped=false;round++;running=true;}
</script>
<div class="stack">
  <h1>{t('practice.title')}</h1><p class="lead">{t('practice.intro')}</p>
  {#if running}
    <p>{skillLabel(selection,settings.value.uiLang)}</p>
    {#key round}<ExerciseRunner {exercises} mode="practice" onOutcome={(ex,outcome)=>{const stars=progress.recordAnswer(skillId(ex.skill),outcome.correct,outcome.firstTry);earned+=stars;if(stars)fx.burst(stars);}} onDone={r=>{result=r;running=false;}}/>{/key}
    <button class="btn ghost" type="button" onclick={()=>{running=false;stopped=true;}}>{t('practice.stop')}</button>
  {:else if result}
    <section class="card stack" aria-live="polite"><h2>{t('exercise.summary')}</h2><p>{t('exercise.score',{score:result.score,total:result.total})}</p><p>{t('exercise.earned',{count:earned})}</p>
      <div class="row"><button class="btn primary" type="button" onclick={start}>{t('practice.again')}</button><button class="btn" type="button" onclick={()=>result=null}>{t('practice.choose')}</button><a class="btn" href={href('/test')}>{t('practice.test')}</a></div>
    </section>
  {:else}
    {#if stopped}<p role="status">{t('practice.stopped')}</p>{/if}
    <SkillPicker value={selection} onChange={v=>selection=v} allowMix/><button class="btn primary" type="button" onclick={start}>{t('practice.start')}</button>
  {/if}
</div>
