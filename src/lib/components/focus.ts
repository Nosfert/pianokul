/**
 * Keyboard / screen-reader focus helpers for the shared components.
 *
 * When a view swaps (a practice round ends, a check round shows its result,
 * the skill list comes back), the element that had focus is removed and
 * browsers drop focus to <body>. `focusIfLost` moves it to a sensible
 * target (usually the new heading) — but only if focus really was lost, so
 * we never steal focus from an input the child is using.
 */
export function focusIfLost(el: HTMLElement | null | undefined, opts?: FocusOptions): void {
	if (!el || typeof document === 'undefined') return;
	const active = document.activeElement;
	if (active && active !== document.body && active !== document.documentElement && active.isConnected) return;
	if (!el.hasAttribute('tabindex') && !isFocusable(el)) el.setAttribute('tabindex', '-1');
	el.focus(opts);
}

function isFocusable(el: HTMLElement): boolean {
	return el.matches('a[href], button, input, select, textarea, [tabindex]');
}
