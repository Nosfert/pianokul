import {expect,it} from 'vitest';
import {registerStrings,translate,type StringBundle} from './translate';
import {coreStrings} from './strings';
const components=import.meta.glob<string>('/src/**/*.svelte',{query:'?raw',import:'default',eager:true});
const bundles=import.meta.glob<{default:{namespace:string;strings:StringBundle}}>('/src/lib/**/*.strings.ts',{eager:true});
it('source grep: every literal t() key resolves in sv and en',()=>{
 registerStrings(coreStrings);
 for(const bundle of Object.values(bundles))registerStrings(bundle.default.strings,bundle.default.namespace);
 let count=0;
 for(const [path,text] of Object.entries(components))for(const m of text.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)){
  const key=m[1];count++;for(const lang of ['sv','en'] as const)expect(translate(lang,key,{count:2,n:1,total:10,name:'C4',score:8,date:'2026-10-07',names:'MIDI',badge:'Silver'}),`${path}: ${lang}:${key}`).not.toBe(key);
 }
 expect(count).toBeGreaterThan(50);
});
