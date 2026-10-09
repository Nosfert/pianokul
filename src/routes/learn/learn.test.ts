// @vitest-environment jsdom
import {expect,it,vi} from 'vitest';
import {render,screen} from '@testing-library/svelte';
import {setUiLang} from '$lib/stores/settings.svelte';
import Page from './+page.svelte';
import Detail from './[id]/+page.svelte';
const route=vi.hoisted(()=>({params:{id:'keyboard'}}));
vi.mock('$app/state',()=>({page:route}));
it('lists five bilingual hash-linked lessons',()=>{
 setUiLang('en');const {unmount}=render(Page);expect(screen.getAllByRole('link').map(x=>x.getAttribute('href'))).toEqual(['#/learn/keyboard','#/learn/note-names','#/learn/treble','#/learn/bass','#/learn/both-hands']);unmount();
 setUiLang('sv');render(Page);expect(screen.getByText('Lär dig')).toBeTruthy();
});
it('renders the selected lesson or a friendly invalid-id state',()=>{
 setUiLang('en');route.params.id='keyboard';const {unmount}=render(Detail);expect(screen.getByRole('heading',{level:1}).textContent).toBe('Find your way around the keyboard');unmount();
 route.params.id='unknown';render(Detail);expect(screen.getByText('That lesson does not exist.')).toBeTruthy();expect(screen.getByRole('link').getAttribute('href')).toBe('#/learn');
});
