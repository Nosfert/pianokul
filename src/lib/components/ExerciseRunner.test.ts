// @vitest-environment jsdom
import {expect,it,vi} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/svelte';
import {setUiLang} from '$lib/stores/settings.svelte';
import type {Exercise} from '$lib/core/exercises/types';
import ExerciseRunner from './ExerciseRunner.svelte';
const ex:Exercise={id:'x',kind:'read-note',skill:{kind:'read-note',hand:'left',level:1},clef:'bass',targets:[60],octaveMatters:true,range:{lo:53,hi:60}};
async function press(container:HTMLElement,midi:number) {const key=container.querySelector(`[data-midi="${midi}"]`)!;await fireEvent.keyDown(key,{key:'Enter'});await fireEvent.keyUp(key,{key:'Enter'});}
it('unlocks hint, reveals, reports once and finishes after Next',async()=> {
  setUiLang('en');const onOutcome=vi.fn(),onDone=vi.fn();
  const {container}=render(ExerciseRunner,{props:{exercises:[ex],mode:'practice',onOutcome,onDone}});
  expect(container.querySelector('[data-clef="bass"]')).toBeTruthy();
  await press(container,55);await press(container,57);expect(screen.getByText(/Hint: the names/)).toBeTruthy();
  await press(container,59);expect(screen.getByText(/Here is the answer: C4/)).toBeTruthy();expect(onOutcome).toHaveBeenCalledTimes(1);
  await press(container,60);expect(onOutcome).toHaveBeenCalledTimes(1);
  await fireEvent.click(screen.getByRole('button',{name:'See the result'}));
  expect(onDone).toHaveBeenCalledWith(expect.objectContaining({score:0,total:1,stars:0}));
});
it('test hides labels, names, hints and correctness, including staff accessible answer',async()=> {
  setUiLang('en');const onDone=vi.fn();
  const {container}=render(ExerciseRunner,{props:{exercises:[ex],mode:'test',onDone}});
  expect(container.querySelectorAll('.key .name,.staff .name,.dot')).toHaveLength(0);
  expect(container.querySelector('svg.staff')!.getAttribute('aria-label')).not.toContain('C4');
  await press(container,55);expect(screen.getByText(/Answer saved/)).toBeTruthy();expect(screen.queryByText(/Not quite|Correct!|Hint:/)).toBeNull();
  await fireEvent.click(screen.getByRole('button',{name:'See the result'}));expect(onDone).toHaveBeenCalledWith(expect.objectContaining({score:0}));
});
it('name-key choices check pitch class and report a correct outcome',async()=> {
  setUiLang('en');const onOutcome=vi.fn();
  render(ExerciseRunner,{props:{exercises:[{...ex,kind:'name-key',choices:[60,62,64,65]}],mode:'practice',onDone:vi.fn(),onOutcome}});
  await fireEvent.click(screen.getByRole('button',{name:'C'}));expect(onOutcome).toHaveBeenCalledWith(expect.anything(),{correct:true,firstTry:true,stars:2});
});
it('name-key help really exposes key names after two wrong choices',async()=> {
  setUiLang('en');
  const {container}=render(ExerciseRunner,{props:{exercises:[{...ex,kind:'name-key',choices:[60,62,64,65]}],mode:'practice',onDone:vi.fn()}});
  expect(container.querySelector('.key .name')).toBeNull();
  await fireEvent.click(screen.getByRole('button',{name:'D'}));await fireEvent.click(screen.getByRole('button',{name:'D'}));
  expect(container.querySelector('[data-midi="60"] .name')!.textContent).toBe('C4');
});
