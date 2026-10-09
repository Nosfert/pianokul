// @vitest-environment jsdom
import {expect,it,vi} from 'vitest';
import {createRawSnippet,tick} from 'svelte';
import {render} from '@testing-library/svelte';
import {progress} from '$lib/stores/progress.svelte';
import {setUiLang,setReduceMotion} from '$lib/stores/settings.svelte';
import Layout from './+layout.svelte';
vi.mock('$app/navigation',()=>({afterNavigate:vi.fn()}));
vi.mock('$app/state',()=>({page:{route:{id:'/'}}}));
it('shows reactive persisted stars/streak and applies display preferences',async()=>{
 progress.reset();setUiLang('en');setReduceMotion(false);
 const {container}=render(Layout,{props:{children:createRawSnippet(()=>({render:()=>'<h1>Probe</h1>'}))}});
 expect(container.querySelector('.stars')!.textContent).toContain('0');
 progress.recordAnswer('read-note/right/1',true,true);await tick();
 expect(container.querySelector('.stars')!.textContent).toContain('2');expect(container.querySelector('.streak')).toBeTruthy();
 expect(document.documentElement.lang).toBe('en-GB');setUiLang('sv');setReduceMotion(true);await tick();
 expect(document.documentElement.lang).toBe('sv-SE');expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);setReduceMotion(false);
});
