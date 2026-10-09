// @vitest-environment jsdom
import {beforeEach,expect,it} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/svelte';
import {settings,setUiLang} from '$lib/stores/settings.svelte';
import {progress} from '$lib/stores/progress.svelte';
import Page from './+page.svelte';
beforeEach(()=>{settings.reset();setUiLang('en');progress.reset();});
it('persists every preference, including H/B and sound',async()=>{
 render(Page);const selects=screen.getAllByRole('combobox');
 await fireEvent.change(selects[1],{target:{value:'both'}});await fireEvent.change(selects[2],{target:{value:'B'}});
 await fireEvent.click(screen.getByRole('checkbox',{name:'Play sound'}));await fireEvent.click(screen.getByRole('checkbox',{name:'Show key names while I practise'}));await fireEvent.click(screen.getByRole('checkbox',{name:'Reduce movement and animations'}));
 expect(settings.value).toMatchObject({hand:'both',svNaming:'B',sound:false,keyLabels:false,reduceMotion:true});
 expect(JSON.parse(localStorage.getItem('pianokul.settings.v1')!)).toMatchObject({hand:'both',svNaming:'B',sound:false});
 await fireEvent.change(selects[0],{target:{value:'sv'}});expect(screen.getByRole('heading',{level:1}).textContent).toBe('Inställningar');
});
it('cancel keeps progress; confirm removes it but retains settings and restores focus',async()=>{
 progress.recordTest('read-note/right/1',10,10);progress.markLessonDone('keyboard');render(Page);
 await fireEvent.click(screen.getByRole('button',{name:'Reset my progress'}));expect(document.activeElement).toBe(screen.getByRole('button',{name:'Yes, reset'}));
 await fireEvent.click(screen.getByRole('button',{name:'No, keep them'}));expect(progress.stars).toBe(15);
 await fireEvent.click(screen.getByRole('button',{name:'Reset my progress'}));await fireEvent.click(screen.getByRole('button',{name:'Yes, reset'}));
 expect(progress.stars).toBe(0);expect(progress.state.lessonsDone).toEqual([]);expect(settings.value.uiLang).toBe('en');expect(document.activeElement).toBe(screen.getByRole('button',{name:'Reset my progress'}));
});
