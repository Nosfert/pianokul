/**
 * localStorage-backed reactive value (Svelte 5 runes). The value is treated
 * as immutable: replace it with `value = ...` or `update(fn)`. Every write
 * is saved immediately, so progress survives reloads; changes made in
 * another tab are picked up via the `storage` event.
 */
/** Every localStorage key the app writes starts with this prefix. */
export const STORAGE_PREFIX = 'pianokul.';

function hasStorage(): boolean {
	try {
		return typeof localStorage !== 'undefined';
	} catch {
		return false;
	}
}

export class Persisted<T> {
	#value: T = $state.raw(null as T);
	readonly key: string;
	readonly #initial: () => T;
	readonly #migrate: (raw: unknown) => T;

	constructor(key: string, initial: () => T, migrate: (raw: unknown) => T) {
		this.key = STORAGE_PREFIX + key;
		this.#initial = initial;
		this.#migrate = migrate;
		this.#value = this.#load();
		if (typeof window !== 'undefined') {
			window.addEventListener('storage', (e) => {
				if (e.key === this.key) this.#value = this.#load();
			});
		}
	}

	#load(): T {
		if (!hasStorage()) return this.#initial();
		try {
			const raw = localStorage.getItem(this.key);
			return raw == null ? this.#initial() : this.#migrate(JSON.parse(raw));
		} catch (err) {
			console.warn(`[storage] could not read ${this.key}, starting fresh`, err);
			return this.#initial();
		}
	}

	#save() {
		if (!hasStorage()) return;
		try {
			localStorage.setItem(this.key, JSON.stringify(this.#value));
		} catch (err) {
			console.warn(`[storage] could not save ${this.key}`, err);
		}
	}

	get value(): T {
		return this.#value;
	}

	set value(next: T) {
		this.#value = next;
		this.#save();
	}

	update(fn: (prev: T) => T) {
		this.value = fn(this.#value);
	}

	reset() {
		this.value = this.#initial();
	}
}
