// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { migrateSettings, setSvNaming, setUiLang, settings } from './settings.svelte';
import { STORAGE_PREFIX } from './persisted.svelte';

describe('settings store', () => {
	it('migrates junk to defaults', () => {
		expect(migrateSettings(null)).toEqual({ version: 1, uiLang: 'sv', hand: 'right', svNaming: 'H', sound: true, keyLabels: true, reduceMotion: false });
		expect(migrateSettings({ uiLang: 'de', hand: 'left', svNaming: 'B', sound: false })).toMatchObject({ uiLang: 'sv', hand: 'left', svNaming: 'B', sound: false });
	});
	it('persists under the pianokul prefix', () => {
		setUiLang('en');
		setSvNaming('B');
		expect(settings.value.uiLang).toBe('en');
		const raw = localStorage.getItem('pianokul.settings.v1');
		expect(raw).not.toBeNull();
		expect(JSON.parse(raw as string)).toMatchObject({ uiLang: 'en', svNaming: 'B' });
		expect(STORAGE_PREFIX).toBe('pianokul.');
	});
});
