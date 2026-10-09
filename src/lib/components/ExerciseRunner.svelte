<script lang="ts">
  import {untrack} from 'svelte';
  import Keyboard, {type KeyHighlight} from './Keyboard.svelte';
  import Staff, {type StaffNote} from './Staff.svelte';
  import MicBar from './MicBar.svelte';
  import type {Exercise} from '$lib/core/exercises/types';
  import {answer,createRunState,hintVisible,nextQuestion,runResult,type Mode,type Outcome,type RunResult} from '$lib/core/exercises/run';
  import {noteName,noteNameWithOctave} from '$lib/core/music/notes';
  import {t} from '$lib/stores/i18n.svelte';
  import {naming,settings} from '$lib/stores/settings.svelte';
  let {exercises,mode,onOutcome,onDone}: {exercises:Exercise[];mode:Mode;onOutcome?:(ex:Exercise,outcome:Outcome)=>void;onDone:(result:RunResult)=>void}=$props();
  // A new round must mount a new runner via the parent's keyed block.
  let run=$state(untrack(()=>createRunState(exercises,mode)));
  /** Last key heard on the real piano for this question, shown on the on-screen keyboard. */
  let micHeard=$state<number|null>(null);
  const ex=$derived(run.exercises[run.index]);
  const hint=$derived(hintVisible(run));
  const target=$derived(ex?.targets[run.step] ?? ex?.targets[0]);
  const highlight=$derived.by(()=> {
    const out:Record<number,KeyHighlight>={};
    if (!ex) return out;
    if(ex.kind==='name-key') out[ex.targets[0]]='target';
    if(run.mode==='practice' && hint && target!==undefined) out[target]='hint';
    if(run.feedback==='reveal') out[target]='target';
    if(run.mode==='practice' && micHeard!==null && out[micHeard]===undefined) out[micHeard]=run.feedback==='wrong'?'wrong':'played';
    return out;
  });
  const notes=$derived<StaffNote[]>(ex?.targets.map((midi,i)=>({midi,state:i===run.step?'current':'normal'})) ?? []);
  function submit(midi:number) {
    const previous=run;
    run=answer(run,midi);
    if(previous.phase==='active' && run.phase==='resolved') onOutcome?.(ex,run.outcomes[run.outcomes.length-1]);
  }
  /** A key heard on the real piano. For name-key the child names the key on screen, so the mic is not used. */
  function micNote(midi:number) {
    if(!ex || ex.kind==='name-key' || run.phase!=='active') return;
    micHeard=midi;
    submit(midi);
  }
  function advance() {
    run=nextQuestion(run);
    micHeard=null;
    if(run.phase==='done') onDone(runResult(run));
  }
</script>
{#if ex && run.phase!=='done'}
  <section class="card stack" aria-label={t('exercise.position',{n:run.index+1,total:run.exercises.length})}>
    <p class="pill">{t('exercise.position',{n:run.index+1,total:run.exercises.length})}</p>
    <h2>{t(`exercise.prompts.${ex.kind}`,{name:ex.octaveMatters?noteNameWithOctave(ex.targets[0],naming()):noteName(ex.targets[0],naming())})}</h2>
    {#if ex.kind==='find-key'}<p>{t(ex.octaveMatters?'exercise.exactOctave':'exercise.anyOctave')}</p>{/if}
    {#if ex.kind==='read-note' || ex.kind==='play-melody'}
      <Staff clef={ex.skill.hand==='both'?'grand':ex.skill.hand==='left'?'bass':'treble'} {notes} showNames={run.mode==='practice' && hint} label={run.mode==='test'?t('exercise.testLabel'):undefined}/>
    {/if}
    {#if ex.kind==='play-melody'}<p>{t('exercise.step',{n:run.step+1,total:ex.targets.length})}</p>{/if}
    <Keyboard lo={ex.range.lo} hi={ex.range.hi} labels={run.mode==='test'?'none':hint?'all':ex.kind==='name-key'?'none':settings.value.keyLabels?'white':'none'}
      {highlight} showMiddleC={run.mode!=='test'} disabled={run.phase==='resolved' && run.feedback!=='reveal'}
      onNoteOn={ex.kind==='name-key'?undefined:submit}/>
    {#if ex.kind==='name-key'}
      <div class="row">{#each ex.choices ?? [] as midi}<button class="btn" type="button" disabled={run.phase!=='active'} onclick={()=>submit(midi)}>{noteName(midi,naming())}</button>{/each}</div>
    {/if}
    {#if ex.kind!=='name-key'}<MicBar onNote={micNote} disabled={run.phase!=='active'}/>{/if}
    <p class="muted">{t('exercise.keyboardHelp')}</p>
    <div aria-live="polite" aria-atomic="true">
      {#if run.feedback==='reveal'}<p>{t('exercise.reveal',{name:noteNameWithOctave(target,naming())})}</p>
      {:else if run.feedback!=='none'}<p>{t(`exercise.${run.feedback}`)}</p>{/if}
      {#if hint && run.phase==='active'}<p>{t('exercise.hint')}</p>{/if}
    </div>
    {#if run.phase==='resolved'}<button class="btn primary" type="button" onclick={advance}>{t(run.index===run.exercises.length-1?'exercise.finish':'exercise.next')}</button>{/if}
  </section>
{/if}
