// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';
import ErrorPage from './+error.svelte';
import LangToggle from '$lib/components/LangToggle.svelte';
import StarsBadge from '$lib/components/StarsBadge.svelte';
import { settings, setUiLang } from '$lib/stores/settings.svelte';

describe('home page', () => {
	it('renders four tiles with hash links in Swedish by default', () => {
		setUiLang('sv');
		render(Page);
		const links = screen.getAllByRole('link');
		expect(links.map((l) => l.getAttribute('href'))).toEqual(['#/learn', '#/practice', '#/test', '#/play']);
		expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Hej! Vad vill du göra idag?');
		expect(screen.getByText('Testa dig')).toBeTruthy();
	});
	it('switches to English with the toggle', async () => {
		render(LangToggle);
		render(Page);
		await fireEvent.click(screen.getByRole('button', { name: /English/ }));
		expect(settings.value.uiLang).toBe('en');
		expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Hi! What do you want to do today?');
		setUiLang('sv');
	});
});

describe('error page and stars badge', () => {
	it('error page links home', () => {
		render(ErrorPage);
		expect(screen.getByRole('link').getAttribute('href')).toBe('#/');
	});
	it('stars badge shows stars and hides a zero streak', () => {
		const { container } = render(StarsBadge, { props: { stars: 7, streak: 0 } });
		expect(container.querySelector('.stars')!.textContent).toContain('7');
		expect(container.querySelector('.streak')).toBeNull();
	});
});
