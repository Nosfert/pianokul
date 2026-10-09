<script lang="ts">
 import Keyboard from './Keyboard.svelte';
 import Staff from './Staff.svelte';
 import MicBar from './MicBar.svelte';
 import {formatLesson,type Lesson} from '$lib/content/lessons';
 import {createTaskState,pressTask} from '$lib/core/lessonTask';
 import {noteNameWithOctave} from '$lib/core/music/notes';
 import {t} from '$lib/stores/i18n.svelte';
 import {naming,settings} from '$lib/stores/settings.svelte';
 import {progress} from '$lib/stores/progress.svelte';
 import {href} from '$lib/nav';
 let {lesson}:{lesson:Lesson}=$props();
 let index=$state(0),taskState=$state(createTaskState()),completed=$state<number[]>([]),finished=$state(false);
 const lang=$derived(settings.value.uiLang),step=$derived(lesson.steps[index]);
 const done=$derived(completed.includes(index));
 function press(midi:number){taskState=pressTask(taskState,step.task,midi);if(taskState.done && !done)completed=[...completed,index];}
 function move(delta:-1|1){if(index+delta<0 || index+delta>=lesson.steps.length || delta===1 && !done)return;index+=delta;taskState=createTaskState();}
 function finish(){if(!done || completed.length!==lesson.steps.length)return;progress.markLessonDone(lesson.id);finished=true;}
</script>
<div class="stack">
 <h1>{lesson.title[lang]}</h1>
 {#if finished}
  <section class="card stack" aria-live="polite"><h2>{t('learn.complete')}</h2><p>{t('learn.completeText')}</p><div class="row"><a class="btn primary" href={href('/practice')}>{t('learn.practice')}</a><a class="btn" href={href('/learn')}>{t('learn.all')}</a></div></section>
 {:else}
  <p class="pill">{t('learn.progress',{n:index+1,total:lesson.steps.length})}</p>
  <section class="card stack"><h2>{step.title[lang]}</h2>{#each step.text[lang] as paragraph}<p>{formatLesson(paragraph,naming())}</p>{/each}
   {#if step.staff}<Staff clef={step.staff.clef} notes={step.staff.notes.map(midi=>({midi,accidental:step.staff?.accidental}))} showNames/>{/if}
   <h3>{t('learn.try')}</h3><p>{formatLesson(step.task.instruction[lang],naming())}</p>
   {#if step.task.kind==='press-sequence' && !done}<p>{t('learn.sequence',{name:noteNameWithOctave(step.task.targets[taskState.index],naming())})}</p>{/if}
   <Keyboard lo={step.keyboard.lo} hi={step.keyboard.hi} labels={step.keyboard.labels} onNoteOn={press}/>
   <MicBar onNote={press} disabled={done}/>
   <p role="status">{done?t('learn.correct'):taskState.feedback==='wrong'?t('learn.wrong'):taskState.feedback==='correct'?t('learn.partial'):''}</p>
   <div class="row"><button type="button" class="btn" disabled={index===0} onclick={()=>move(-1)}>{t('common.previous')}</button>
    {#if index<lesson.steps.length-1}<button type="button" class="btn primary" disabled={!done} onclick={()=>move(1)}>{t('common.next')}</button>
    {:else}<button type="button" class="btn primary" disabled={!done} onclick={finish}>{t('learn.finish')}</button>{/if}
   </div>
  </section>
  <a class="btn" href={href('/learn')}>{t('learn.all')}</a>
 {/if}
</div>
