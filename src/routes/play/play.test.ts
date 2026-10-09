// @vitest-environment jsdom
import {beforeEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen,waitFor} from '@testing-library/svelte';
import {setSound,setUiLang} from '$lib/stores/settings.svelte';
import Page from './+page.svelte';
const mocks=vi.hoisted(()=>({on:vi.fn(),off:vi.fn(),allOff:vi.fn(),resume:vi.fn(async()=>{}),connect:vi.fn(),supported:vi.fn(()=>false)}));
vi.mock('$lib/audio/synth',()=>({getSynth:()=>({noteOn:mocks.on,noteOff:mocks.off,allOff:mocks.allOff,resume:mocks.resume})}));
vi.mock('$lib/input/midiInput',()=>({midiSupported:mocks.supported,connectMidi:mocks.connect}));
beforeEach(()=>{vi.clearAllMocks();mocks.supported.mockReturnValue(false);setUiLang('en');setSound(true);});
it('plays computer notes, shifts octave, releases on blur and ignores text fields',async()=>{
  const {container,unmount}=render(Page);
  await fireEvent.keyDown(window,{code:'KeyA'});expect(mocks.on).toHaveBeenCalledWith(60,.8);expect(screen.getByText('Last note: C4')).toBeTruthy();
  await fireEvent.keyUp(window,{code:'KeyA'});expect(mocks.off).toHaveBeenCalledWith(60);
  await fireEvent.keyDown(window,{code:'KeyZ'});await fireEvent.keyDown(window,{code:'KeyA'});expect(mocks.on).toHaveBeenCalledWith(48,.8);
  await fireEvent.blur(window);expect(container.querySelector('button[data-midi="48"]')!.getAttribute('aria-pressed')).toBe('false');
  const input=document.createElement('input');container.append(input);const count=mocks.on.mock.calls.length;await fireEvent.keyDown(input,{code:'KeyD'});expect(mocks.on).toHaveBeenCalledTimes(count);
  unmount();expect(mocks.allOff).toHaveBeenCalled();
});
it('pointer sound is not duplicated and sound-off still shows notes',async()=>{
  const {container}=render(Page);const key=container.querySelector('button[data-midi="60"]')!;
  await fireEvent.keyDown(key,{key:'Enter'});await fireEvent.keyUp(key,{key:'Enter'});expect(mocks.on).toHaveBeenCalledTimes(1);
  setSound(false);await fireEvent.keyDown(window,{code:'KeyS'});expect(mocks.on).toHaveBeenCalledTimes(1);expect(screen.getByText('Last note: D4')).toBeTruthy();
});
it('optional MIDI can refuse without breaking the piano',async()=>{
  mocks.supported.mockReturnValue(true);mocks.connect.mockRejectedValueOnce(new Error('denied'));
  render(Page);await fireEvent.click(screen.getByRole('button',{name:'Connect MIDI keyboard'}));
  expect(await screen.findByText(/MIDI could not connect/)).toBeTruthy();await fireEvent.keyDown(window,{code:'KeyA'});expect(mocks.on).toHaveBeenCalled();
});
it('disconnects a permission request that completes after unmount',async()=>{
  mocks.supported.mockReturnValue(true);let resolve!:(c:{disconnect:()=>void;devices:string[]})=>void;
  mocks.connect.mockReturnValueOnce(new Promise(r=>resolve=r));const disconnect=vi.fn();
  const {unmount}=render(Page);await fireEvent.click(screen.getByRole('button',{name:'Connect MIDI keyboard'}));unmount();resolve({disconnect,devices:[]});await waitFor(()=>expect(disconnect).toHaveBeenCalledOnce());
});
it('MIDI note input plays, highlights and releases notes without extra permissions',async()=>{
  mocks.supported.mockReturnValue(true);let input!:import('$lib/input/midiInput').MidiHandlers;const disconnect=vi.fn();
  mocks.connect.mockImplementationOnce(async(h:import('$lib/input/midiInput').MidiHandlers)=>{input=h;h.onDevices?.(['Keys']);return {devices:['Keys'],disconnect};});
  const {container}=render(Page);await fireEvent.click(screen.getByRole('button',{name:'Connect MIDI keyboard'}));
  await screen.findByRole('button',{name:'Disconnect MIDI'});input.onNoteOn(48,.5);await waitFor(()=>expect(screen.getByText('Last note: C3')).toBeTruthy());
  expect(mocks.on).toHaveBeenCalledWith(48,.5);expect(container.querySelector('button[data-midi="48"]')!.getAttribute('aria-pressed')).toBe('true');
  input.onNoteOff(48);await waitFor(()=>expect(container.querySelector('button[data-midi="48"]')!.getAttribute('aria-pressed')).toBe('false'));
  await fireEvent.click(screen.getByRole('button',{name:'Disconnect MIDI'}));expect(disconnect).toHaveBeenCalledOnce();
});
