// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/svelte';
import {progress} from '$lib/stores/progress.svelte';
import {setUiLang} from '$lib/stores/settings.svelte';
import Page from './+page.svelte';
it('shows empty state then badges and skill labels in both languages',async()=>{
 setUiLang('en');progress.reset();const {container}=render(Page);expect(screen.getByText(/No badges yet/)).toBeTruthy();
 progress.recordTest('read-note/left/2',8,10);progress.recordTest('mixed/both/1',10,10);
 await fireEvent.click(screen.getByRole('link',{name:'Take a new challenge'}));
 expect(screen.getByText('Read notes · Left hand · Level 2')).toBeTruthy();expect(screen.getByText('Mixed · Both hands · Level 1')).toBeTruthy();
 expect(container.querySelectorAll('article h2')[0].textContent).toContain('Gold');
 setUiLang('sv');await fireEvent.click(screen.getByRole('link',{name:/Take a new challenge|Ta en ny utmaning/}));expect(screen.getByText('Läs noter · Vänster hand · Nivå 2')).toBeTruthy();
});
