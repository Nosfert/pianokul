<script lang="ts">
 import {tick} from 'svelte';
 import {settings,setUiLang,setHand,setSvNaming,setSound,setKeyLabels,setReduceMotion,type Hand,type SvNaming} from '$lib/stores/settings.svelte';
 import {LANGS,LANG_NAME,type Lang} from '$lib/core/lang';
 import {HANDS} from '$lib/core/exercises/types';
 import {progress} from '$lib/stores/progress.svelte';
 import {t} from '$lib/stores/i18n.svelte';
 import {href} from '$lib/nav';
 import {micCalibration} from '$lib/stores/mic.svelte';
 let confirming=$state(false),resetDone=$state(false),yesButton=$state<HTMLButtonElement|null>(null),resetButton=$state<HTMLButtonElement|null>(null);
 async function ask(){confirming=true;resetDone=false;await tick();yesButton?.focus();}
 async function close(reset:boolean){if(reset){progress.reset();resetDone=true;}confirming=false;await tick();resetButton?.focus();}
</script>
<div class="stack"><h1>{t('settings.title')}</h1><p class="lead">{t('settings.intro')}</p>
 <section class="card stack">
  <label>{t('settings.language')}<select value={settings.value.uiLang} onchange={e=>setUiLang(e.currentTarget.value as Lang)}>{#each LANGS as lang}<option value={lang}>{LANG_NAME[lang]}</option>{/each}</select></label>
  <label>{t('settings.hand')}<select value={settings.value.hand} onchange={e=>setHand(e.currentTarget.value as Hand)}>{#each HANDS as hand}<option value={hand}>{t(`exercise.hand.${hand}`)}</option>{/each}</select></label>
  <label>{t('settings.naming')}<select value={settings.value.svNaming} onchange={e=>setSvNaming(e.currentTarget.value as SvNaming)}><option value="H">{t('settings.h')}</option><option value="B">{t('settings.b')}</option></select></label><p class="muted">{t('settings.namingHelp')}</p>
  <label class="row"><input type="checkbox" checked={settings.value.sound} onchange={e=>setSound(e.currentTarget.checked)}/>{t('settings.sound')}</label>
  <label class="row"><input type="checkbox" checked={settings.value.keyLabels} onchange={e=>setKeyLabels(e.currentTarget.checked)}/>{t('settings.labels')}</label>
  <label class="row"><input type="checkbox" checked={settings.value.reduceMotion} onchange={e=>setReduceMotion(e.currentTarget.checked)}/>{t('settings.motion')}</label>
 </section>
 <section class="card stack"><h2>🎹 {t('mic.settingsTitle')}</h2><p>{t('mic.settingsHelp')}</p>
  <div class="row"><a class="btn primary" href={href('/mic')}>{micCalibration.value.at?t('mic.recalibrate'):t('mic.calibrate')}</a></div>
  {#if micCalibration.value.at}<p class="muted">{t('mic.tuning',{cents:micCalibration.value.tuningCents})}</p>{/if}
 </section>
 <button class="btn ghost" type="button" bind:this={resetButton} disabled={confirming} onclick={ask}>{t('settings.reset')}</button>
 {#if confirming}<fieldset class="card stack"><legend>{t('settings.confirm')}</legend><p>{t('settings.warning')}</p><div class="row"><button class="btn" type="button" onclick={()=>close(false)}>{t('settings.cancel')}</button><button class="btn primary" type="button" bind:this={yesButton} onclick={()=>close(true)}>{t('settings.yes')}</button></div></fieldset>{/if}
 {#if resetDone}<p role="status">{t('settings.resetDone')}</p>{/if}
</div>
<style>
 label:not(.row){display:grid;gap:.35rem;}label{font-weight:700;min-height:48px;}
 select{font:inherit;min-height:48px;padding:.5rem;border:2px solid var(--line);border-radius:12px;max-width:100%;background:white;color:var(--ink);}
 input[type='checkbox']{width:24px;height:24px;accent-color:var(--accent);}
 legend{font-weight:800;}
</style>
