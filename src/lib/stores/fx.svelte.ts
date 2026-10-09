/**
 * Global "fun effects": star bursts and the big celebration overlay.
 * Rendered once by <Effects /> in the root layout.
 */
export interface Burst {
	id: number;
	stars: number;
	text?: string;
}

export interface BigCelebration {
	id: number;
	title: string;
	text?: string;
	emoji?: string;
}

let nextId = 1;

class FxState {
	bursts = $state<Burst[]>([]);
	big = $state<BigCelebration | null>(null);

	/** Small "+N ⭐" pop with confetti. */
	burst(stars: number, text?: string) {
		const b = { id: nextId++, stars, text };
		this.bursts = [...this.bursts, b];
		setTimeout(() => (this.bursts = this.bursts.filter((x) => x.id !== b.id)), 1800);
	}

	/** Full-screen celebration (check passed, skill mastered). */
	celebrate(title: string, text?: string, emoji = '🏆') {
		this.big = { id: nextId++, title, text, emoji };
	}

	closeBig() {
		this.big = null;
	}
}

export const fx = new FxState();
