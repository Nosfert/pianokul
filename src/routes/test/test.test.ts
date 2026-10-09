// @vitest-environment jsdom
import {beforeEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/svelte';
import {progress} from '$lib/stores/progress.svelte';
import {fx} from '$lib/stores/fx.svelte';
import {setUiLang} from '$lib/stores/settings.svelte';
import Page from './+page.svelte';
vi.mock('$lib/core/exercises/generate',async importOriginal=>{
  const real=await importOriginal<typeof import('$lib/core/exercises/generate')>();
  return {...real,generateMixedRound:(refs:import('$lib/core/exercises/types').SkillRef[])=>Array.from({length:10},(_,i)=>({id:`x${i}`,skill:refs[0],kind:'read-note',targets:[60],range:{lo:60,hi:64},clef:'treble',octaveMatters:true}))};
});
beforeEach(()=>{setUiLang('en');progress.reset();fx.closeBig();});
for(const score of [7,8,10])it(`records ${score}/10 once, with the correct badge`,async()=>{
  const {container}=render(Page);await fireEvent.click(screen.getByRole('button',{name:'Start the test'}));
  for(let i=0;i<10;i++){
    expect(container.querySelector('.key .name')).toBeNull();
    const key=container.querySelector(`button[data-midi="${i<score?60:62}"]`)!;
    await fireEvent.keyDown(key,{key:'Enter'});await fireEvent.keyUp(key,{key:'Enter'});
    expect(screen.getByText(/Answer saved/)).toBeTruthy();
    await fireEvent.click(screen.getByRole('button',{name:i===9?'See the result':'Next question'}));
  }
  expect(screen.getByText(`${score} / 10`)).toBeTruthy();expect(progress.state.tests).toHaveLength(1);expect(progress.totals.answered).toBe(0);
  expect(progress.state.badges['read-note/right/1']?.level).toBe(score===10?'gold':score===8?'silver':undefined);
  expect(progress.stars).toBe(score===10?15:score===8?5:0);expect(!!fx.big).toBe(score>=8);
});
it('does not record a cancelled test',async()=>{render(Page);await fireEvent.click(screen.getByRole('button',{name:'Start the test'}));await fireEvent.click(screen.getByRole('button',{name:'Cancel the test'}));expect(progress.state.tests).toHaveLength(0);});
