// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/svelte';
import {getLesson} from '$lib/content/lessons';
import {progress} from '$lib/stores/progress.svelte';
import {setUiLang,setSvNaming} from '$lib/stores/settings.svelte';
import LessonView from './LessonView.svelte';
it('gates every step and persists completion after all tasks, not before',async()=>{
 setUiLang('en');progress.reset();const lesson=getLesson('keyboard')!;const {container}=render(LessonView,{props:{lesson}});
 expect((screen.getByRole('button',{name:'Next'}) as HTMLButtonElement).disabled).toBe(true);
 for(let i=0;i<5;i++){
  for(const midi of lesson.steps[i].task.targets){const key=container.querySelector(`button[data-midi="${midi}"]`)!;await fireEvent.keyDown(key,{key:'Enter'});await fireEvent.keyUp(key,{key:'Enter'});}
  expect(progress.isLessonDone('keyboard')).toBe(false);
  await fireEvent.click(screen.getByRole('button',{name:i===4?'Finish the lesson':'Next'}));
 }
 expect(progress.isLessonDone('keyboard')).toBe(true);expect(screen.getByText('Lesson complete!')).toBeTruthy();
 expect(JSON.parse(localStorage.getItem('pianokul.progress.v1')!).lessonsDone).toEqual(['keyboard']);
});
it('updates Swedish H/B content reactively',async()=>{
 setUiLang('sv');setSvNaming('H');const {container}=render(LessonView,{props:{lesson:getLesson('note-names')!}});
 expect(container.textContent).toContain('C D E F G A H');setSvNaming('B');await fireEvent.click(screen.getByRole('button',{name:'Föregående'}));expect(container.textContent).toContain('C D E F G A B');setSvNaming('H');
});
