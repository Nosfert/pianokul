<script lang="ts">
  import {onDestroy} from 'svelte';
  import Keyboard from '$lib/components/Keyboard.svelte';
  import Staff from '$lib/components/Staff.svelte';
  import MicBar from '$lib/components/MicBar.svelte';
  import {getSynth} from '$lib/audio/synth';
  import {noteNameWithOctave} from '$lib/core/music/notes';
  import {actionForKey,computerLabels,DEFAULT_BASE,shiftBase,clampBase,BASE_MIN,BASE_MAX} from '$lib/input/computerKeys';
  import {connectMidi,midiSupported,type MidiConnection} from '$lib/input/midiInput';
  import {naming,settings} from '$lib/stores/settings.svelte';
  import {t} from '$lib/stores/i18n.svelte';
  let base=$state(DEFAULT_BASE),history=$state<number[]>([]),held=$state<Record<string,number>>({}),midiHeld=$state<number[]>([]);
  let connection=$state<MidiConnection|null>(null),devices=$state<string[]>([]),connecting=$state(false),error=$state(false),disposed=false;
  const pressed=$derived([...new Set([...Object.values(held),...midiHeld])]);
  const notes=$derived(history.map((midi,i)=>({midi,state:i===history.length-1?'current' as const:'normal' as const})));
  function remember(midi:number){history=[...history,midi].slice(-8);}
  function soundOn(midi:number,velocity=.8){if(settings.value.sound){const synth=getSynth();void synth.resume();synth.noteOn(midi,velocity);}}
  function releaseAll(){held={};midiHeld=[];getSynth().allOff();}
  function shift(delta:-1|1){releaseAll();base=shiftBase(base,delta);}
  function keydown(e:KeyboardEvent){
    const target=e.target;
    const text=target instanceof Element && !!target.closest('input,textarea,select,[contenteditable]');
    const action=actionForKey(e,base,text);if(!action)return;e.preventDefault();
    if(action.type==='octave'){shift(action.delta);return;}
    if(e.code in held)return;
    held={...held,[e.code]:action.midi};soundOn(action.midi);remember(action.midi);
  }
  function keyup(e:KeyboardEvent){const midi=held[e.code];if(midi===undefined)return;const next={...held};delete next[e.code];held=next;getSynth().noteOff(midi);}
  async function connect(){
    if(connecting || connection)return;connecting=true;error=false;
    try{
      const c=await connectMidi({
        onNoteOn(midi,velocity){if(disposed || midi<21 || midi>108)return;midiHeld=[...new Set([...midiHeld,midi])];base=clampBase(midi);soundOn(midi,velocity);remember(midi);},
        onNoteOff(midi){midiHeld=midiHeld.filter(m=>m!==midi);getSynth().noteOff(midi);},
        onDevices(names){if(!disposed)devices=names;}
      });
      if(disposed)c.disconnect();else connection=c;
    }catch{if(!disposed)error=true;}finally{if(!disposed)connecting=false;}
  }
  function disconnect(){connection?.disconnect();connection=null;devices=[];releaseAll();}
  $effect(()=>{if(!settings.value.sound)getSynth().allOff();});
  onDestroy(()=>{disposed=true;connection?.disconnect();releaseAll();});
</script>
<svelte:window onkeydown={keydown} onkeyup={keyup} onblur={releaseAll}/>
<div class="stack">
  <h1>{t('play.title')}</h1><p class="lead">{t('play.intro')}</p>
  <section class="card stack">
    <p class="lead" aria-live="polite">{history.length?t('play.last',{name:noteNameWithOctave(history[history.length-1],naming())}):t('play.empty')}</p>
    <Staff clef="grand" {notes} showNames/>
    <div class="row"><button type="button" class="btn" onclick={()=>shift(-1)} disabled={base===BASE_MIN}>{t('play.down')}</button><span>{t('play.octave',{name:noteNameWithOctave(base,naming())})}</span><button type="button" class="btn" onclick={()=>shift(1)} disabled={base===BASE_MAX}>{t('play.up')}</button></div>
    <Keyboard lo={Math.min(base,...midiHeld)} hi={Math.max(base+16,...midiHeld)} {pressed} computerLabels={computerLabels(base)} onNoteOn={remember}/>
    <MicBar onNote={remember}/>
    <p>{t('play.help')}</p><button type="button" class="btn ghost" onclick={()=>{releaseAll();history=[];}}>{t('play.clear')}</button>
  </section>
  {#if midiSupported()}
    <section class="card stack">
      {#if connection}<p role="status">{devices.length?t('play.connected',{names:devices.join(', ')}):t('play.noDevices')}</p><button class="btn" type="button" onclick={disconnect}>{t('play.disconnect')}</button>
      {:else}<button class="btn" type="button" disabled={connecting} onclick={connect}>{t(connecting?'play.connecting':'play.connect')}</button>{/if}
      {#if error}<p role="status">{t('play.denied')}</p>{/if}
    </section>
  {/if}
</div>
