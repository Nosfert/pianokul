<script lang="ts">
  import { EXERCISE_KINDS, HANDS, LEVELS, type Level } from '$lib/core/exercises/types';
  import type { Hand } from '$lib/core/music/notes';
  import { t } from '$lib/stores/i18n.svelte';
  import type { Selection } from './skillLabels';
  let {value,onChange,allowMix=false}: {value:Selection;onChange:(value:Selection)=>void;allowMix?:boolean} = $props();
</script>
<fieldset class="card stack">
  <legend>{t('exercise.choose')}</legend>
  <label>{t('exercise.kindLabel')}
    <select value={value.kind} onchange={e=>onChange({...value,kind:e.currentTarget.value as Selection['kind']})}>
      {#each EXERCISE_KINDS as kind}<option value={kind}>{t(`exercise.kind.${kind}`)}</option>{/each}
      {#if allowMix}<option value="mixed">{t('exercise.kind.mixed')}</option>{/if}
    </select>
  </label>
  <label>{t('exercise.handLabel')}
    <select value={value.hand} onchange={e=>onChange({...value,hand:e.currentTarget.value as Hand})}>
      {#each HANDS as hand}<option value={hand}>{t(`exercise.hand.${hand}`)}</option>{/each}
    </select>
  </label>
  <label>{t('exercise.levelLabel')}
    <select value={value.level} onchange={e=>onChange({...value,level:Number(e.currentTarget.value) as Level})}>
      {#each LEVELS as level}<option value={level}>{t(`exercise.level.${level}`)} — {t(`exercise.levelHelp.${level}`)}</option>{/each}
    </select>
  </label>
</fieldset>
<style>
  legend {font-weight:800;padding:0 .5rem;}
  label {display:grid;gap:.35rem;font-weight:700;}
  select {font:inherit;min-height:48px;border:2px solid var(--line);border-radius:12px;padding:.5rem;background:white;color:var(--ink);max-width:100%;width:100%;}
</style>
