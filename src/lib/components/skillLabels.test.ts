import { expect, it } from 'vitest';
import { registerStrings } from '$lib/core/i18n/translate';
import bundle from '$lib/strings/exercise.strings';
import { badgeLabel, refsFor, selectionId, skillLabel } from './skillLabels';
it('names skills and mixed selections in both languages',()=> {
  registerStrings(bundle.strings,bundle.namespace);
  const ref = {kind:'read-note',hand:'left',level:2} as const;
  expect(skillLabel(ref,'sv')).toBe('Läs noter · Vänster hand · Nivå 2');
  expect(skillLabel(ref,'en')).toBe('Read notes · Left hand · Level 2');
  expect(selectionId(ref)).toBe('read-note/left/2');
  expect(badgeLabel('mixed/both/4','sv')).toBe('Blandat · Båda händerna · Nivå 4');
  expect(refsFor({...ref,kind:'mixed'}).map(x=>x.kind)).toEqual(['name-key','find-key','read-note','play-melody']);
  expect(refsFor(ref)).toEqual([ref]);
});
