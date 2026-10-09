import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries.
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
			},
			// Pure static SPA: no backend, all state in localStorage. Hash routing
			// (#/learn) means build/ works from any static host without rewrite rules.
			adapter: adapter({ pages: 'build', assets: 'build', fallback: undefined }),
			router: { type: 'hash' }
		}),
		svelteTesting()
	],
	test: {
		// Pure tests run in node. Component tests opt in with `// @vitest-environment jsdom` on line 1.
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});
