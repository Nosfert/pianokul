import type { Exercise } from './types';
import { isAnswerCorrect } from './generate';
export type Mode = 'practice' | 'test';
export interface Outcome { correct: boolean; firstTry: boolean; stars: number }
export interface RunState {
  exercises: Exercise[]; mode: Mode; index: number; step: number; wrong: number;
  failed: boolean; phase: 'active' | 'resolved' | 'done';
  feedback: 'none' | 'wrong' | 'correct' | 'reveal' | 'saved';
  lastAnswer: number | null; outcomes: Outcome[];
}
export interface RunResult { score: number; total: number; stars: number; outcomes: Outcome[] }
export function createRunState(exercises: Exercise[], mode: Mode): RunState {
  return {exercises,mode,index:0,step:0,wrong:0,failed:false,phase:exercises.length?'active':'done',feedback:'none',lastAnswer:null,outcomes:[]};
}
export function hintVisible(s: RunState): boolean { return s.mode === 'practice' && s.wrong >= 2; }
function resolve(s: RunState, correct: boolean, feedback: RunState['feedback']): RunState {
  const firstTry = correct && s.wrong === 0;
  const stars = s.mode === 'practice' && correct ? (firstTry?2:1) : 0;
  return {...s,phase:'resolved',feedback,outcomes:[...s.outcomes,{correct,firstTry,stars}]};
}
export function answer(s: RunState, midi: number): RunState {
  if (s.phase !== 'active' || !Number.isInteger(midi)) return s;
  const ex = s.exercises[s.index];
  const correct = isAnswerCorrect(ex,midi,s.step);
  const n = {...s,lastAnswer:midi,wrong:s.wrong+(correct?0:1),failed:s.failed || !correct};
  if (s.mode === 'practice' && !correct) return n.wrong >= 3 ? resolve(n,false,'reveal') : {...n,feedback:'wrong'};
  if (s.step < ex.targets.length-1) return {...n,step:s.step+1,feedback:s.mode==='test'?'saved':'correct'};
  return resolve(n,s.mode==='practice'?true:!n.failed,s.mode==='test'?'saved':'correct');
}
export function nextQuestion(s: RunState): RunState {
  if (s.phase !== 'resolved') return s;
  const index = s.index+1;
  return {...s,index,step:0,wrong:0,failed:false,lastAnswer:null,feedback:'none',phase:index >= s.exercises.length?'done':'active'};
}
export function runResult(s: RunState): RunResult {
  return {score:s.outcomes.filter(x=>x.correct).length,total:s.exercises.length,stars:s.outcomes.reduce((sum,x)=>sum+x.stars,0),outcomes:[...s.outcomes]};
}
