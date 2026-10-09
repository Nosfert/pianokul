import type {LessonTask} from '$lib/content/lessons';
export interface TaskState {index:number;seen:number[];done:boolean;feedback:'none'|'correct'|'wrong'}
export function createTaskState():TaskState{return {index:0,seen:[],done:false,feedback:'none'};}
export function pressTask(state:TaskState,task:LessonTask,midi:number):TaskState {
  if(state.done)return state;
  if(task.kind==='press-key')return {...state,done:midi===task.targets[0],feedback:midi===task.targets[0]?'correct':'wrong'};
  if(task.kind==='press-all'){
    if(!task.targets.includes(midi))return {...state,feedback:'wrong'};
    const seen=[...new Set([...state.seen,midi])];return {...state,seen,done:task.targets.every(n=>seen.includes(n)),feedback:'correct'};
  }
  const correct=midi===task.targets[state.index];
  const index=correct?state.index+1:midi===task.targets[0]?1:0;
  return {...state,index,done:index===task.targets.length,feedback:correct?'correct':'wrong'};
}
