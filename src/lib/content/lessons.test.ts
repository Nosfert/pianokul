import {expect,it} from 'vitest';
import {formatLesson,getLesson,lessons} from './lessons';
it('has five uniquely named lessons and 25 bilingual, playable steps',()=>{
  expect(lessons.map(l=>l.id)).toEqual(['keyboard','note-names','treble','bass','both-hands']);
  expect(lessons.flatMap(l=>l.steps)).toHaveLength(25);
  for(const lesson of lessons){
    expect(new Set(lesson.steps.map(s=>s.id)).size).toBe(5);
    for(const lang of ['sv','en'] as const){expect(lesson.title[lang].length).toBeGreaterThan(5);expect(lesson.intro[lang].length).toBeGreaterThan(10);}
    for(const s of lesson.steps){
      expect(s.text.sv.length).toBe(s.text.en.length);
      for(const lang of ['sv','en'] as const){expect(s.title[lang]).toBeTruthy();expect(s.task.instruction[lang]).toBeTruthy();expect(s.text[lang].every(p=>p.length>10)).toBe(true);}
      expect(s.task.targets.length).toBeGreaterThan(0);
      for(const n of s.task.targets){expect(n).toBeGreaterThanOrEqual(s.keyboard.lo);expect(n).toBeLessThanOrEqual(s.keyboard.hi);}
    }
  }
  expect(getLesson('bass')!.steps[3].staff!.clef).toBe('bass');expect(getLesson('note-names')!.steps[3].staff!.accidental).toBe('flat');expect(getLesson('nope')).toBeUndefined();
});
it('formats naming convention without HTML and uses English B',()=>{
  expect(formatLesson('{letters} / {B} / {Bb}',{lang:'sv',svNaming:'H'})).toBe('C D E F G A H / H / B');
  expect(formatLesson('{letters} / {B} / {Bb}',{lang:'sv',svNaming:'B'})).toBe('C D E F G A B / B / Bess');
  expect(formatLesson('{B} / {Bb}',{lang:'en',svNaming:'H'})).toBe('B / B♭');
  for(const lesson of lessons)for(const s of lesson.steps)for(const lang of ['sv','en'] as const)for(const svNaming of ['H','B'] as const){
    for(const p of [...s.text[lang],s.task.instruction[lang]])expect(formatLesson(p,{lang,svNaming})).not.toMatch(/\{\w+\}/);
  }
});
