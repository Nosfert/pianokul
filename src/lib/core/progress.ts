import { addDays, daysBetween } from './dates';

export type BadgeLevel = 'silver' | 'gold';

export interface SkillStats {
	answered: number;
	correct: number;
	firstTry: number;
	lastPractised: string;
}

export interface Badge {
	skill: string;
	level: BadgeLevel;
	score: number;
	total: number;
	earned: string;
}

export interface TestRecord {
	skill: string;
	score: number;
	total: number;
	day: string;
}

export interface ProgressState {
	version: 1;
	stars: number;
	activeDays: string[]; // sorted unique, newest last, max 400
	skills: Record<string, SkillStats>;
	badges: Record<string, Badge>;
	tests: TestRecord[]; // newest last, max 100
	lessonsDone: string[]; // lesson ids
}

export const STARS = { correct: 1, firstTryBonus: 1, testPassed: 5, perfectBonus: 10 } as const;
export const PASS_RATIO = 0.8;

export function emptyProgress(): ProgressState {
	return {
		version: 1,
		stars: 0,
		activeDays: [],
		skills: {},
		badges: {},
		tests: [],
		lessonsDone: [],
	};
}

function isFiniteNumber(n: unknown): n is number {
	return typeof n === 'number' && Number.isFinite(n);
}

function isNonNegativeFiniteNumber(n: unknown): n is number {
	return isFiniteNumber(n) && n >= 0;
}

function isStringArray(arr: unknown): arr is string[] {
	return Array.isArray(arr) && arr.every((x) => typeof x === 'string');
}

function isSkillStats(obj: unknown): obj is SkillStats {
	if (typeof obj !== 'object' || obj === null) return false;
	const s = obj as SkillStats;
	return (
		isNonNegativeFiniteNumber(s.answered) &&
		isNonNegativeFiniteNumber(s.correct) &&
		isNonNegativeFiniteNumber(s.firstTry) &&
		typeof s.lastPractised === 'string'
	);
}

function isBadge(obj: unknown): obj is Badge {
	if (typeof obj !== 'object' || obj === null) return false;
	const b = obj as Badge;
	return (
		typeof b.skill === 'string' &&
		(b.level === 'silver' || b.level === 'gold') &&
		isNonNegativeFiniteNumber(b.score) &&
		isNonNegativeFiniteNumber(b.total) &&
		typeof b.earned === 'string'
	);
}

function isTestRecord(obj: unknown): obj is TestRecord {
	if (typeof obj !== 'object' || obj === null) return false;
	const t = obj as TestRecord;
	return (
		typeof t.skill === 'string' &&
		isNonNegativeFiniteNumber(t.score) &&
		isNonNegativeFiniteNumber(t.total) &&
		typeof t.day === 'string'
	);
}

export function migrateProgress(raw: unknown): ProgressState {
	if (typeof raw !== 'object' || raw === null) return emptyProgress();

	const obj = raw as Partial<ProgressState>;

	const stars = isNonNegativeFiniteNumber(obj.stars) ? obj.stars : 0;
	const activeDays = isStringArray(obj.activeDays) ? obj.activeDays : [];
	const skills =
		typeof obj.skills === 'object' && obj.skills !== null
			? Object.entries(obj.skills).reduce<Record<string, SkillStats>>((acc, [key, val]) => {
					if (isSkillStats(val)) acc[key] = val;
					return acc;
			  }, {})
			: {};
	const badges =
		typeof obj.badges === 'object' && obj.badges !== null
			? Object.entries(obj.badges).reduce<Record<string, Badge>>((acc, [key, val]) => {
					if (isBadge(val)) acc[key] = val;
					return acc;
			  }, {})
			: {};
	const tests = isStringArray(obj.tests) ? [] : (obj.tests as TestRecord[] | undefined);
	const testsValid = Array.isArray(tests) && tests.every(isTestRecord) ? tests : [];
	const lessonsDone = isStringArray(obj.lessonsDone) ? obj.lessonsDone : [];

	return {
		version: obj.version === 1 ? 1 : 1,
		stars,
		activeDays,
		skills,
		badges,
		tests: testsValid,
		lessonsDone,
	};
}

export function markActive(state: ProgressState, day: string): ProgressState {
	const exists = state.activeDays.includes(day);
	if (exists) return state;

	const newDays = [...state.activeDays, day];
	// Sort by date (oldest first, newest last) and take last 400
	// daysBetween(a, b) > 0 means a < b (a is earlier), so a should come first
	// But sort expects negative if a should come before b
	// So we need: daysBetween(b, a) which is -(daysBetween(a, b))
	const sorted = newDays.sort((a, b) => daysBetween(b, a));
	const capped = sorted.slice(-400);

	return { ...state, activeDays: capped };
}

export function recordAnswer(
	state: ProgressState,
	skill: string,
	correct: boolean,
	firstTry: boolean,
	day: string,
): { state: ProgressState; stars: number } {
	let starsEarned = 0;
	if (correct) {
		starsEarned = STARS.correct + (firstTry ? STARS.firstTryBonus : 0);
	}

	// Update skill stats
	const existing = state.skills[skill];
	const newSkillStats: SkillStats = {
		answered: (existing?.answered ?? 0) + 1,
		correct: (existing?.correct ?? 0) + (correct ? 1 : 0),
		firstTry: (existing?.firstTry ?? 0) + (firstTry ? 1 : 0),
		lastPractised: day,
	};

	// Update active days
	const stateWithDay = markActive(state, day);

	return {
		state: {
			...stateWithDay,
			stars: stateWithDay.stars + starsEarned,
			skills: { ...stateWithDay.skills, [skill]: newSkillStats },
		},
		stars: starsEarned,
	};
}

export function badgeLevelFor(score: number, total: number): BadgeLevel | null {
	if (total <= 0) return null;
	const ratio = score / total;
	if (score === total) return 'gold';
	if (ratio >= PASS_RATIO) return 'silver';
	return null;
}

export function recordTest(
	state: ProgressState,
	skill: string,
	score: number,
	total: number,
	day: string,
): { state: ProgressState; stars: number; badge: BadgeLevel | null; upgraded: boolean } {
	const badge = badgeLevelFor(score, total);
	if (badge === null) {
		// No badge earned, but we still record the test
		const newTest: TestRecord = { skill, score, total, day };
		const newTests = [...state.tests, newTest].slice(-100);
		const stateWithDay = markActive(state, day);
		return {
			state: { ...stateWithDay, tests: newTests },
			stars: 0,
			badge: null,
			upgraded: false,
		};
	}

	const existingBadge = state.badges[skill];
	// Upgrade only if no existing badge, OR existing badge is lower level
	// (gold > silver, so going gold->silver is NOT an upgrade)
	let shouldUpgrade = false;
	if (existingBadge === undefined) {
		shouldUpgrade = true;
	} else if (existingBadge.level === 'silver' && badge === 'gold') {
		shouldUpgrade = true;
	}
	const starsEarned = STARS.testPassed + (score === total ? STARS.perfectBonus : 0);

	// A worse (or equal) result never touches the stored badge: only write a
	// new badge object when upgrading, otherwise keep the existing one as-is.
	const newBadges = shouldUpgrade
		? { ...state.badges, [skill]: { skill, level: badge, score, total, earned: day } satisfies Badge }
		: state.badges;

	// Update tests array
	const newTest: TestRecord = { skill, score, total, day };
	const newTests = [...state.tests, newTest].slice(-100);

	const stateWithDay = markActive(state, day);

	return {
		state: {
			...stateWithDay,
			stars: stateWithDay.stars + starsEarned,
			badges: newBadges,
			tests: newTests,
		},
		stars: starsEarned,
		badge: badge,
		upgraded: shouldUpgrade,
	};
}

export function markLessonDone(state: ProgressState, lessonId: string): ProgressState {
	if (state.lessonsDone.includes(lessonId)) return state;
	return { ...state, lessonsDone: [...state.lessonsDone, lessonId] };
}

export function streak(state: ProgressState, today: string): number {
	if (state.activeDays.length === 0) return 0;

	// Find the most recent day (oldest first, so last is newest)
	const last = state.activeDays[state.activeDays.length - 1];

	// If today is more than 1 day after last active, streak is 0
	const daysDiff = daysBetween(last, today);
	if (daysDiff > 1) return 0;

	// Count consecutive days ending at last (or today if today is 1 day after last)
	const endDay = daysDiff === 0 ? today : last;
	// Sort oldest first (using daysBetween(b, a) to get ascending order)
	const sortedDays = [...state.activeDays].sort((a, b) => daysBetween(b, a));
	let count = 0;
	let current = endDay;

	for (let i = sortedDays.length - 1; i >= 0; i--) {
		if (sortedDays[i] === current) {
			count++;
			current = addDays(current, -1);
		} else if (daysBetween(sortedDays[i], current) === 1) {
			// Skip gap days if we're still within the streak logic
			current = sortedDays[i];
			count++;
		} else {
			break;
		}
	}

	return count;
}

export function totals(state: ProgressState): { answered: number; correct: number; badges: number; gold: number } {
	let answered = 0;
	let correct = 0;
	for (const skill of Object.values(state.skills)) {
		answered += skill.answered;
		correct += skill.correct;
	}

	let gold = 0;
	for (const badge of Object.values(state.badges)) {
		if (badge.level === 'gold') gold++;
	}

	return {
		answered,
		correct,
		badges: Object.keys(state.badges).length,
		gold,
	};
}
