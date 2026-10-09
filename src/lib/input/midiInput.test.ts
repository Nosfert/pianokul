import { describe, expect, it, vi } from 'vitest';
import { connectMidi, midiSupported, parseMidiMessage, type MidiAccessLike, type MidiInputLike } from './midiInput';

describe('MIDI', () => {
  it('parses note messages on all channels; zero velocity is off', () => {
    for (let ch=0;ch<16;ch++) {
      expect(parseMidiMessage([0x90+ch,60,64])).toEqual({type:'on',midi:60,velocity:64/127});
      expect(parseMidiMessage([0x80+ch,60,64])).toEqual({type:'off',midi:60});
      expect(parseMidiMessage([0x90+ch,60,0])).toEqual({type:'off',midi:60});
    }
    for (const data of [[],[0x90,60],[0xb0,64,127],[0x90,128,64],[0x90,60,-1],[0x90,60,0.5]]) expect(parseMidiMessage(data)).toBeNull();
    expect(midiSupported()).toBe(false);
  });
  it('wires hotplug, releases held notes and disposes idempotently', async () => {
    const a: MidiInputLike = {name:'Keys',onmidimessage:null};
    const b: MidiInputLike = {name:'New',onmidimessage:null};
    const access: MidiAccessLike = {inputs:new Map([['a',a]]),onstatechange:null};
    const h = {onNoteOn:vi.fn(),onNoteOff:vi.fn(),onDevices:vi.fn()};
    const c = await connectMidi(h,async()=>access);
    expect(c.devices).toEqual(['Keys']);
    a.onmidimessage?.({data:new Uint8Array([0x90,60,100])});
    expect(h.onNoteOn).toHaveBeenCalledWith(60,100/127);
    access.inputs.delete('a'); access.inputs.set('b',b); access.onstatechange?.();
    expect(a.onmidimessage).toBeNull(); expect(h.onNoteOff).toHaveBeenCalledWith(60);
    expect(c.devices).toEqual(['New']);
    b.onmidimessage?.({data:new Uint8Array([0x90,64,100])});
    c.disconnect(); c.disconnect();
    expect(h.onNoteOff).toHaveBeenCalledWith(64);
    expect(b.onmidimessage).toBeNull(); expect(access.onstatechange).toBeNull();
  });
  it('propagates permission refusal', async()=> {
    await expect(connectMidi({onNoteOn(){},onNoteOff(){}},async()=>{throw new Error('denied');})).rejects.toThrow('denied');
  });
});
