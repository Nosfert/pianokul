/**
 * Calendar-day helpers (pure). Mastery and streaks work on local calendar
 * days written as "YYYY-MM-DD".
 */
export type DayString = string;

export function localDateString(d: Date = new Date()): DayString {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function toUtc(date: DayString): number {
	const [y, m, d] = date.split('-').map(Number);
	return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: DayString, days: number): DayString {
	return new Date(toUtc(date) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: DayString, b: DayString): number {
	return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}
