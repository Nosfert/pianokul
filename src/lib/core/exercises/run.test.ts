import { describe, expect, it } from 'vitest';
import type { Exercise } from './types';
import { answer, createRunState, hintVisible, nextQuestion, runResult } from './run';
function ex(targets=[60],kind:Exercise['kind']='read-note'): Exercise {return {id:'x',kind,skill:{kind,hand:'right',level:1},clef:'treble',targets,octaveMatters:true,range:{lo:60,hi:72}};}
describe('run reducer',()=> {
  it('hints at two, reveals at three, no score or repeat award',()=> {
    let s=createRunState([ex()],'practice'); const before=structuredClone(s);
    expect(nextQuestion(s)).toBe(s);
    s=answer(s,62); expect(s.phase).toBe('active');expect(hintVisible(s)).toBe(false);
    s=answer(s,64);expect(hintVisible(s)).toBe(true);
    s=answer(s,65);expect(s.feedback).toBe('reveal');expect(s.phase).toBe('resolved');
    expect(runResult(s)).toMatchObject({score:0,stars:0});expect(answer(s,60)).toBe(s);
    expect(nextQuestion(s).phase).toBe('done');expect(before.wrong).toBe(0);
  });
  it('earns two flawless stars or one after a retry; pure transitions',()=> {
    const start=createRunState([ex(),ex()],'practice');const snapshot=structuredClone(start);
    let s=answer(start,60);expect(s.outcomes[0]).toEqual({correct:true,firstTry:true,stars:2});expect(start).toEqual(snapshot);
    s=nextQuestion(s); s=answer(s,62);s=answer(s,60);s=nextQuestion(s);
    expect(runResult(s)).toMatchObject({score:2,total:2,stars:3});expect(nextQuestion(s)).toBe(s);expect(answer(s,60)).toBe(s);
  });
  it('practice melody retries the same step and awards once per question',()=> {
    let s=createRunState([ex([60,62,64],'play-melody')],'practice');
    s=answer(s,60);s=answer(s,65);expect(s.step).toBe(1);
    s=answer(s,62);s=answer(s,64);expect(s.outcomes).toEqual([{correct:true,firstTry:false,stars:1}]);
  });
  it('test wrong single answer resolves neutrally with no hint',()=> {
    const s=answer(createRunState([ex()],'test'),65);expect(s.feedback).toBe('saved');expect(hintVisible(s)).toBe(false);expect(runResult(s).score).toBe(0);
  });
  it('test melody consumes one attempt per note and fails whole item on any wrong note',()=> {
    let s=createRunState([ex([60,62,64],'play-melody')],'test');
    s=answer(s,60);s=answer(s,65);expect(s.step).toBe(2);s=answer(s,64);
    expect(s.phase).toBe('resolved');expect(s.feedback).toBe('saved');expect(runResult(s)).toMatchObject({score:0,stars:0});
  });
  it('test perfect 10 questions and empty rounds',()=> {
    let s=createRunState(Array.from({length:10},()=>ex()),'test');
    for(let i=0;i<10;i++) s=nextQuestion(answer(s,60));
    expect(s.phase).toBe('done');expect(runResult(s)).toMatchObject({score:10,total:10,stars:0});
    expect(createRunState([],'test').phase).toBe('done');
  });
});
