export type MidiMessage = { type: 'on'; midi: number; velocity: number } | { type: 'off'; midi: number };
export interface MidiHandlers {
  onNoteOn(midi: number, velocity: number): void;
  onNoteOff(midi: number): void;
  onDevices?(names: string[]): void;
}
export interface MidiInputLike {
  name?: string | null;
  state?: string;
  onmidimessage: ((event: { data: Uint8Array | null }) => void) | null;
}
export interface MidiAccessLike {
  inputs: Map<string, MidiInputLike>;
  onstatechange: (() => void) | null;
}
export type MidiRequest = () => Promise<MidiAccessLike>;
export interface MidiConnection { devices: string[]; disconnect(): void }
export function parseMidiMessage(data: ArrayLike<number>): MidiMessage | null {
  if (data.length < 3) return null;
  const [status, midi, velocity] = [data[0], data[1], data[2]];
  if (![status, midi, velocity].every(Number.isInteger) || status < 128 || status > 255 || midi < 0 || midi > 127 || velocity < 0 || velocity > 127) return null;
  if ((status & 0xf0) === 0x90 && velocity > 0) return { type: 'on', midi, velocity: velocity / 127 };
  if ((status & 0xf0) === 0x80 || (status & 0xf0) === 0x90) return { type: 'off', midi };
  return null;
}
export function midiSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.requestMIDIAccess === 'function';
}
export async function connectMidi(h: MidiHandlers, request?: MidiRequest): Promise<MidiConnection> {
  if (!request && !midiSupported()) throw new Error('MIDI unavailable');
  const access = await (request ? request() : navigator.requestMIDIAccess({ sysex: false }) as unknown as Promise<MidiAccessLike>);
  const wired = new Map<MidiInputLike, Set<number>>();
  let disposed = false;
  const connection: MidiConnection = { devices: [], disconnect };
  function unbind(input: MidiInputLike) {
    for (const midi of wired.get(input) ?? []) h.onNoteOff(midi);
    input.onmidimessage = null;
    wired.delete(input);
  }
  function refresh() {
    if (disposed) return;
    const live = [...access.inputs.values()].filter(i => i.state !== 'disconnected');
    for (const input of [...wired.keys()]) if (!live.includes(input)) unbind(input);
    for (const input of live) {
      if (wired.has(input)) continue;
      const held = new Set<number>();
      wired.set(input, held);
      input.onmidimessage = e => {
        if (disposed || !e.data) return;
        const message = parseMidiMessage(e.data);
        if (!message) return;
        if (message.type === 'on') { held.add(message.midi); h.onNoteOn(message.midi, message.velocity); }
        else { held.delete(message.midi); h.onNoteOff(message.midi); }
      };
    }
    connection.devices = live.map(i => i.name || 'MIDI');
    h.onDevices?.([...connection.devices]);
  }
  function disconnect() {
    if (disposed) return;
    disposed = true;
    access.onstatechange = null;
    for (const input of [...wired.keys()]) unbind(input);
    connection.devices = [];
    h.onDevices?.([]);
  }
  access.onstatechange = refresh;
  refresh();
  return connection;
}
