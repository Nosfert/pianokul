/**
 * Small seeded random helpers so exercise generators give varied but
 * reproducible items (same seed => same exercises, handy for tests).
 */
export type Rng = () => number;

/** mulberry32 — tiny, fast, good enough for exercise variety. */
export function seededRng(seed: number): Rng {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Turn any string into a numeric seed. */
export function hashSeed(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

export function randomSeed(): number {
	return Math.floor(Math.random() * 2 ** 32);
}

/** Integer in [min, max] inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
	return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
	if (items.length === 0) throw new Error('pick() from empty list');
	return items[Math.floor(rng() * items.length)] as T;
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[out[i], out[j]] = [out[j] as T, out[i] as T];
	}
	return out;
}
