import { translate } from '$lib/core/i18n/translate';
import type { Lang } from '$lib/core/lang';
import { parseSkillId, type ExerciseKind, type Level, type SkillRef } from '$lib/core/exercises/types';
import type { Hand } from '$lib/core/music/notes';
export type Selection = { kind: ExerciseKind | 'mixed'; hand: Hand; level: Level };
export function kindLabel(kind: Selection['kind'], lang: Lang): string { return translate(lang, `exercise.kind.${kind}`); }
export function handLabel(hand: Hand, lang: Lang): string { return translate(lang, `exercise.hand.${hand}`); }
export function levelLabel(level: Level, lang: Lang): string { return translate(lang, `exercise.level.${level}`); }
export function skillLabel(ref: Selection, lang: Lang): string { return [kindLabel(ref.kind,lang),handLabel(ref.hand,lang),levelLabel(ref.level,lang)].join(' · '); }
export function selectionId(ref: Selection): string { return `${ref.kind}/${ref.hand}/${ref.level}`; }
export function refsFor(ref: Selection): SkillRef[] {
  return (ref.kind === 'mixed' ? ['name-key','find-key','read-note','play-melody'] as const : [ref.kind]).map(kind => ({kind,hand:ref.hand,level:ref.level}));
}
export function badgeLabel(id: string, lang: Lang): string {
  const parsed = parseSkillId(id);
  if (parsed) return skillLabel(parsed,lang);
  const [kind,hand,level,...rest] = id.split('/');
  if (kind === 'mixed' && !rest.length && ['right','left','both'].includes(hand) && ['1','2','3','4'].includes(level)) return skillLabel({kind:'mixed',hand:hand as Hand,level:Number(level) as Level},lang);
  return id;
}
