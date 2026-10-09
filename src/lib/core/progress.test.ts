import { describe, expect, it } from 'vitest';
import {
	badgeLevelFor,
	emptyProgress,
	markLessonDone,
	migrateProgress,
	markActive,
	recordAnswer,
	recordTest,
	streak,
	totals,
	type BadgeLevel,
	type ProgressState,
} from './progress';

// Simple deep copy for immutability tests
function deepCopy<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

describe('emptyProgress', () => {
	it('returns a valid empty state', () => {
		const state = emptyProgress();
		expect(state.version).toBe(1);
		expect(state.stars).toBe(0);
		expect(state.activeDays).toEqual([]);
		expect(state.skills).toEqual({});
		expect(state.badges).toEqual({});
		expect(state.tests).toEqual([]);
		expect(state.lessonsDone).toEqual([]);
	});
});

describe('migrateProgress', () => {
	it('returns empty state for null', () => {
		const state = migrateProgress(null);
		expect(state.version).toBe(1);
		expect(state.stars).toBe(0);
		expect(state.activeDays).toEqual([]);
	});

	it('returns empty state for empty object', () => {
		const state = migrateProgress({});
		expect(state.stars).toBe(0);
		expect(state.activeDays).toEqual([]);
	});

	it('returns empty state for invalid stars (string)', () => {
		const state = migrateProgress({ stars: 'x', badges: 5, lessonsDone: 'no' });
		expect(state.stars).toBe(0);
		expect(state.badges).toEqual({});
		expect(state.lessonsDone).toEqual([]);
	});

	it('keeps valid stars, badges, lessonsDone', () => {
		const input = {
			stars: 10,
			lessonsDone: ['lesson1', 'lesson2'],
			badges: { 'read-note/1': { skill: 'read-note/1', level: 'gold', score: 10, total: 10, earned: '2026-10-07' } },
		};
		const state = migrateProgress(input);
		expect(state.stars).toBe(10);
		expect(state.lessonsDone).toEqual(['lesson1', 'lesson2']);
		expect(state.badges['read-note/1']).toBeDefined();
	});

	it('invalidates invalid SkillStats', () => {
		const input = {
			skills: {
				valid: { answered: 1, correct: 1, firstTry: 1, lastPractised: '2026-10-07' },
				invalid1: { answered: 'x', correct: 1, firstTry: 1, lastPractised: '2026-10-07' },
				invalid2: { answered: 1, correct: 1, firstTry: 1 },
			},
		};
		const state = migrateProgress(input);
		expect(Object.keys(state.skills)).toHaveLength(1);
		expect(state.skills['valid']).toBeDefined();
	});

	it('invalidates invalid badges', () => {
		const input = {
			badges: {
				valid: { skill: 'x', level: 'gold', score: 10, total: 10, earned: '2026-10-07' },
				invalid: { skill: 'x', level: 'platinum' as BadgeLevel, score: 10, total: 10, earned: '2026-10-07' },
			},
		};
		const state = migrateProgress(input);
		expect(Object.keys(state.badges)).toHaveLength(1);
	});

	it('invalidates invalid test records', () => {
		const input = {
			tests: [
				{ skill: 'x', score: 8, total: 10, day: '2026-10-07' },
				{ skill: 'y', score: 'x' as unknown as number, total: 10, day: '2026-10-07' },
			],
		};
		const state = migrateProgress(input);
		expect(state.tests).toHaveLength(0);
	});
});

describe('markActive', () => {
	it('adds a new day', () => {
		const state = emptyProgress();
		const result = markActive(state, '2026-10-07');
		expect(result.activeDays).toEqual(['2026-10-07']);
	});

	it('does not add duplicate day', () => {
		const state = markActive(emptyProgress(), '2026-10-07');
		const result = markActive(state, '2026-10-07');
		expect(result.activeDays).toEqual(['2026-10-07']);
	});

	it('adds multiple days sorted newest last', () => {
		let state = emptyProgress();
		state = markActive(state, '2026-10-05');
		state = markActive(state, '2026-10-07');
		state = markActive(state, '2026-10-06');
		expect(state.activeDays).toEqual(['2026-10-05', '2026-10-06', '2026-10-07']);
	});

	it('caps activeDays at 400', () => {
		let state = emptyProgress();
		for (let i = 0; i < 450; i++) {
			const day = `2026-10-${String(i + 1).padStart(2, '0')}`;
			state = markActive(state, day);
		}
		expect(state.activeDays).toHaveLength(400);
		// After adding 450 days, keeping last 400 means days 51-450
		expect(state.activeDays[0]).toBe('2026-10-51');
		expect(state.activeDays[399]).toBe('2026-10-450');
	});

	it('preserves other fields', () => {
		const state = { ...emptyProgress(), stars: 5, lessonsDone: ['l1'] };
		const result = markActive(state, '2026-10-07');
		expect(result.stars).toBe(5);
		expect(result.lessonsDone).toEqual(['l1']);
	});
});

describe('recordAnswer', () => {
	it('correct answer on first try', () => {
		const state = emptyProgress();
		const result = recordAnswer(state, 'read-note/right/1', true, true, '2026-10-07');
		expect(result.stars).toBe(2);
		expect(result.state.stars).toBe(2);
		expect(result.state.skills['read-note/right/1']).toEqual({
			answered: 1,
			correct: 1,
			firstTry: 1,
			lastPractised: '2026-10-07',
		});
		expect(result.state.activeDays).toEqual(['2026-10-07']);
	});

	it('correct answer not on first try', () => {
		const state = emptyProgress();
		const result = recordAnswer(state, 'read-note/right/1', true, false, '2026-10-07');
		expect(result.stars).toBe(1);
		expect(result.state.stars).toBe(1);
		expect(result.state.skills['read-note/right/1']).toEqual({
			answered: 1,
			correct: 1,
			firstTry: 0,
			lastPractised: '2026-10-07',
		});
	});

	it('wrong answer', () => {
		const state = emptyProgress();
		const result = recordAnswer(state, 'read-note/right/1', false, true, '2026-10-07');
		expect(result.stars).toBe(0);
		expect(result.state.stars).toBe(0);
		expect(result.state.skills['read-note/right/1']).toEqual({
			answered: 1,
			correct: 0,
			firstTry: 1,
			lastPractised: '2026-10-07',
		});
		expect(result.state.activeDays).toEqual(['2026-10-07']);
	});

	it('updates existing skill stats', () => {
		let state = emptyProgress();
		state = recordAnswer(state, 'x', true, true, '2026-10-07').state;
		state = recordAnswer(state, 'x', false, false, '2026-10-07').state;
		expect(state.skills['x']).toEqual({ answered: 2, correct: 1, firstTry: 1, lastPractised: '2026-10-07' });
	});

	it('is immutable', () => {
		const state = emptyProgress();
		const before = deepCopy(state);
		recordAnswer(state, 'x', true, true, '2026-10-07');
		expect(JSON.stringify(state)).toBe(JSON.stringify(before));
	});
});

describe('badgeLevelFor', () => {
	it('10/10 returns gold', () => {
		expect(badgeLevelFor(10, 10)).toBe('gold');
	});

	it('8/10 returns silver', () => {
		expect(badgeLevelFor(8, 10)).toBe('silver');
	});

	it('7/10 returns null', () => {
		expect(badgeLevelFor(7, 10)).toBeNull();
	});

	it('4/5 returns silver', () => {
		expect(badgeLevelFor(4, 5)).toBe('silver');
	});

	it('0/10 returns null', () => {
		expect(badgeLevelFor(0, 10)).toBeNull();
	});

	it('1/1 returns gold', () => {
		expect(badgeLevelFor(1, 1)).toBe('gold');
	});
});

describe('recordTest', () => {
	it('8/10 returns silver badge', () => {
		const state = emptyProgress();
		const result = recordTest(state, 'x', 8, 10, '2026-10-07');
		expect(result.stars).toBe(5);
		expect(result.badge).toBe('silver');
		expect(result.upgraded).toBe(true);
		expect(result.state.badges['x']).toEqual({
			skill: 'x',
			level: 'silver',
			score: 8,
			total: 10,
			earned: '2026-10-07',
		});
	});

	it('10/10 upgrades from silver to gold', () => {
		let state = emptyProgress();
		state = recordTest(state, 'x', 8, 10, '2026-10-07').state;
		const result = recordTest(state, 'x', 10, 10, '2026-10-07');
		expect(result.stars).toBe(15);
		expect(result.badge).toBe('gold');
		expect(result.upgraded).toBe(true);
		expect(result.state.badges['x'].score).toBe(10);
	});

	it('9/10 does not upgrade gold badge', () => {
		let state = emptyProgress();
		state = recordTest(state, 'x', 10, 10, '2026-10-07').state;
		const result = recordTest(state, 'x', 9, 10, '2026-10-07');
		expect(result.stars).toBe(5);
		expect(result.badge).toBe('silver');
		expect(result.upgraded).toBe(false);
		expect(result.state.badges['x'].score).toBe(10);
		expect(result.state.badges['x'].level).toBe('gold');
	});

	it('8/10 after gold keeps the stored gold badge', () => {
		let state = emptyProgress();
		state = recordTest(state, 'x', 10, 10, '2026-10-07').state;
		const result = recordTest(state, 'x', 8, 10, '2026-10-08');
		expect(result.stars).toBe(5);
		expect(result.upgraded).toBe(false);
		expect(result.state.badges['x']).toEqual({
			skill: 'x',
			level: 'gold',
			score: 10,
			total: 10,
			earned: '2026-10-07',
		});
	});

	it('7/10 returns no badge, appends test', () => {
		const state = emptyProgress();
		const result = recordTest(state, 'y', 7, 10, '2026-10-07');
		expect(result.stars).toBe(0);
		expect(result.badge).toBeNull();
		expect(result.upgraded).toBe(false);
		expect(result.state.tests).toHaveLength(1);
		expect(result.state.tests[0]).toEqual({ skill: 'y', score: 7, total: 10, day: '2026-10-07' });
	});

	it('caps tests at 100', () => {
		let state = emptyProgress();
		for (let i = 0; i < 150; i++) {
			state = recordTest(state, `skill-${i % 10}`, 5, 10, `2026-10-${String((i % 28) + 1).padStart(2, '0')}`).state;
		}
		expect(state.tests).toHaveLength(100);
	});

	it('is immutable', () => {
		const state = emptyProgress();
		const before = deepCopy(state);
		recordTest(state, 'x', 8, 10, '2026-10-07');
		expect(JSON.stringify(state)).toBe(JSON.stringify(before));
	});
});

describe('markLessonDone', () => {
	it('adds a lesson', () => {
		const state = emptyProgress();
		const result = markLessonDone(state, 'lesson1');
		expect(result.lessonsDone).toEqual(['lesson1']);
	});

	it('is idempotent', () => {
		const state = emptyProgress();
		let result = markLessonDone(state, 'lesson1');
		result = markLessonDone(result, 'lesson1');
		expect(result.lessonsDone).toEqual(['lesson1']);
	});

	it('preserves other fields', () => {
		const state = { ...emptyProgress(), stars: 5, activeDays: ['2026-10-07'] };
		const result = markLessonDone(state, 'lesson1');
		expect(result.stars).toBe(5);
		expect(result.activeDays).toEqual(['2026-10-07']);
	});

	it('is immutable', () => {
		const state = emptyProgress();
		const before = deepCopy(state);
		markLessonDone(state, 'lesson1');
		expect(JSON.stringify(state)).toBe(JSON.stringify(before));
	});
});

describe('streak', () => {
	it('empty activeDays returns 0', () => {
		expect(streak(emptyProgress(), '2026-10-07')).toBe(0);
	});

	it('consecutive days ending today returns count', () => {
		const state = markActive(markActive(markActive(emptyProgress(), '2026-10-05'), '2026-10-06'), '2026-10-07');
		expect(streak(state, '2026-10-07')).toBe(3);
	});

	it('consecutive days ending yesterday, today is next day', () => {
		const state = markActive(markActive(markActive(emptyProgress(), '2026-10-05'), '2026-10-06'), '2026-10-07');
		expect(streak(state, '2026-10-08')).toBe(3);
	});

	it('gap breaks streak', () => {
		const state = markActive(markActive(markActive(emptyProgress(), '2026-10-05'), '2026-10-06'), '2026-10-07');
		expect(streak(state, '2026-10-09')).toBe(0);
	});

	it('single day streak', () => {
		const state = markActive(emptyProgress(), '2026-10-07');
		expect(streak(state, '2026-10-07')).toBe(1);
		expect(streak(state, '2026-10-08')).toBe(1);
		expect(streak(state, '2026-10-09')).toBe(0);
	});
});

describe('totals', () => {
	it('returns correct counts', () => {
		let state = emptyProgress();
		state = recordAnswer(state, 'x', true, true, '2026-10-07').state;
		state = recordAnswer(state, 'x', false, false, '2026-10-07').state;
		state = recordTest(state, 'y', 10, 10, '2026-10-07').state;
		state = recordTest(state, 'z', 8, 10, '2026-10-07').state;

		const t = totals(state);
		expect(t.answered).toBe(2);
		expect(t.correct).toBe(1);
		expect(t.badges).toBe(2);
		expect(t.gold).toBe(1);
	});
});

describe('comprehensive example', () => {
	it('matches spec example', () => {
		const state = emptyProgress();
		const r1 = recordAnswer(state, 'read-note/right/1', true, true, '2026-10-07');
		expect(r1.stars).toBe(2);
		expect(r1.state.stars).toBe(2);
		expect(r1.state.skills['read-note/right/1']).toEqual({
			answered: 1,
			correct: 1,
			firstTry: 1,
			lastPractised: '2026-10-07',
		});
		expect(r1.state.activeDays).toEqual(['2026-10-07']);
	});

	it('wrong answer example', () => {
		const state = emptyProgress();
		const r = recordAnswer(state, 'read-note/right/1', false, true, '2026-10-07');
		expect(r.stars).toBe(0);
		expect(r.state.skills['read-note/right/1'].answered).toBe(1);
		expect(r.state.activeDays).toEqual(['2026-10-07']);
	});

	it('test progression example', () => {
		const day = '2026-10-07';

		// First test: 8/10 -> silver
		const s1 = emptyProgress();
		const r1 = recordTest(s1, 'x', 8, 10, day);
		expect(r1.stars).toBe(5);
		expect(r1.badge).toBe('silver');
		expect(r1.upgraded).toBe(true);

		// Upgrade: 10/10 -> gold, stars += 15
		const s2 = r1.state;
		const r2 = recordTest(s2, 'x', 10, 10, day);
		expect(r2.stars).toBe(15);
		expect(r2.badge).toBe('gold');
		expect(r2.upgraded).toBe(true);

		// Worse result: 9/10 -> silver, no upgrade, stars += 5
		const s3 = r2.state;
		const r3 = recordTest(s3, 'x', 9, 10, day);
		expect(r3.stars).toBe(5);
		expect(r3.badge).toBe('silver');
		expect(r3.upgraded).toBe(false);
		expect(s3.badges['x'].score).toBe(10);
	});

	it('test below threshold example', () => {
		const state = emptyProgress();
		const r = recordTest(state, 'y', 7, 10, '2026-10-07');
		expect(r.stars).toBe(0);
		expect(r.badge).toBeNull();
		expect(r.upgraded).toBe(false);
		expect(r.state.tests).toHaveLength(1);
	});
});
