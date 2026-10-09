import {expect,it} from 'vitest';
import {createTaskState,pressTask} from './lessonTask';
import type {LessonTask} from '$lib/content/lessons';
const task=(kind:LessonTask['kind'],targets:number[]):LessonTask=>({kind,targets,instruction:{sv:'Prova',en:'Try'}});
it('single key must match octave, no mutation and completion is stable',()=>{
 const s=createTaskState(),t=task('press-key',[60]);expect(pressTask(s,t,72).done).toBe(false);const done=pressTask(s,t,60);expect(done.done).toBe(true);expect(pressTask(done,t,64)).toBe(done);expect(s).toEqual(createTaskState());
});
it('collects all targets once in any order',()=>{
 const t=task('press-all',[48,60]);let s=createTaskState();s=pressTask(s,t,60);s=pressTask(s,t,60);expect(s.seen).toEqual([60]);s=pressTask(s,t,64);expect(s.done).toBe(false);s=pressTask(s,t,48);expect(s.done).toBe(true);
});
it('sequence restarts after mistakes, including repeated notes',()=>{
 const t=task('press-sequence',[60,62,60]);let s=createTaskState();s=pressTask(s,t,60);expect(s.index).toBe(1);s=pressTask(s,t,64);expect(s.index).toBe(0);expect(s.feedback).toBe('wrong');
 for(const n of [60,62,60])s=pressTask(s,t,n);expect(s.done).toBe(true);
});
it('every curriculum task can be solved',()=>{
 return import('$lib/content/lessons').then(({lessons})=>{for(const step of lessons.flatMap(l=>l.steps)){let s=createTaskState();for(const n of step.task.targets)s=pressTask(s,step.task,n);expect(s.done,step.id).toBe(true);}});
});
