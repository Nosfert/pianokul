import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';

/**
 * Build a link to an app route. The app uses hash routing (`#/units`), so
 * never write raw `href="/units"` — use `href('/units')`.
 */
export function href(path: string): string {
	return resolve(path as Pathname);
}
