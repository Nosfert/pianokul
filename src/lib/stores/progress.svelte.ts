import { localDateString } from '$lib/core/dates';
import {
	emptyProgress,
	markLessonDone,
	migrateProgress,
	recordAnswer,
	recordTest,
	streak,
	totals,
	type BadgeLevel,
	type ProgressState,
} from '$lib/core/progress';
import { Persisted } from './persisted.svelte';

export const progressStore = new Persisted<ProgressState>('progress.v1', emptyProgress, migrateProgress);

export const progress = {
	get state(): ProgressState {
		return progressStore.value;
	},
	get stars(): number {
		return progressStore.value.stars;
	},
	get streak(): number {
		return streak(progressStore.value, localDateString());
	},
	get totals() {
		return totals(progressStore.value);
	},
	/** Records one practice answer; returns the stars earned. */
	recordAnswer(skill: string, correct: boolean, firstTry: boolean): number {
		const r = recordAnswer(progressStore.value, skill, correct, firstTry, localDateString());
		progressStore.value = r.state;
		return r.stars;
	},
	recordTest(skill: string, score: number, total: number): { stars: number; badge: BadgeLevel | null; upgraded: boolean } {
		const r = recordTest(progressStore.value, skill, score, total, localDateString());
		progressStore.value = r.state;
		return { stars: r.stars, badge: r.badge, upgraded: r.upgraded };
	},
	markLessonDone(lessonId: string): void {
		progressStore.value = markLessonDone(progressStore.value, lessonId);
	},
	isLessonDone(lessonId: string): boolean {
		return progressStore.value.lessonsDone.includes(lessonId);
	},
	reset(): void {
		progressStore.reset();
	},
};
