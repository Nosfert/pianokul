// @vitest-environment jsdom
import {beforeEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/svelte';
import {progress} from '$lib/stores/progress.svelte';
import {setUiLang} from '$lib/stores/settings.svelte';
import Page from './+page.svelte';
vi.mock('$lib/core/exercises/generate',async importOriginal=>{
  const real=await importOriginal<typeof import('$lib/core/exercises/generate')>();
  return {...real,generateMixedRound:(refs:import('$lib/core/exercises/types').SkillRef[])=>Array.from({length:10},(_,i)=>({id:`x${i}`,skill:refs[0],kind:'read-note',targets:[60],range:{lo:60,hi:64},clef:'treble',octaveMatters:true}))};
});
beforeEach(()=>{setUiLang('en');progress.reset();});
it('persists each question once, gives a summary and keeps earned stars',async()=>{
  const {container}=render(Page);await fireEvent.click(screen.getByRole('button',{name:'Start practising'}));
  for(let i=0;i<10;i++){
    const key=container.querySelector('button[data-midi="60"]')!;
    await fireEvent.keyDown(key,{key:'Enter'});await fireEvent.keyUp(key,{key:'Enter'});
    await fireEvent.click(screen.getByRole('button',{name:i===9?'See the result':'Next question'}));
  }
  expect(screen.getByText('10 of 10 questions solved')).toBeTruthy();expect(progress.stars).toBe(20);expect(progress.totals.answered).toBe(10);
  expect(JSON.parse(localStorage.getItem('pianokul.progress.v1')!).stars).toBe(20);
  await fireEvent.click(screen.getByRole('button',{name:'Choose a new challenge'}));expect(progress.stars).toBe(20);
});
it('can abandon a round without recording unanswered questions',async()=>{
  render(Page);await fireEvent.click(screen.getByRole('button',{name:'Start practising'}));
  await fireEvent.click(screen.getByRole('button',{name:'End this round'}));expect(progress.totals.answered).toBe(0);expect(screen.getByRole('button',{name:'Start practising'})).toBeTruthy();
});
