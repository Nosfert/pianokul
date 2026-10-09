// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { setUiLang } from '$lib/stores/settings.svelte';
import SkillPicker from './SkillPicker.svelte';
it('provides 4 skills, 3 hands and 4 levels, optionally mixed', async()=> {
  setUiLang('sv'); const onChange=vi.fn();
  const {rerender} = render(SkillPicker,{props:{value:{kind:'read-note',hand:'right',level:1},onChange}});
  const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
  expect(selects.map(x=>x.options.length)).toEqual([4,3,4]);
  await fireEvent.change(selects[1],{target:{value:'left'}});
  expect(onChange).toHaveBeenCalledWith({kind:'read-note',hand:'left',level:1});
  await rerender({value:{kind:'read-note',hand:'right',level:1},onChange,allowMix:true});
  expect(screen.getByRole('option',{name:'Blandat'})).toBeTruthy();
});
