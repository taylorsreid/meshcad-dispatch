import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from 'svelte-adapter-uws';
import uws from 'svelte-adapter-uws/vite';
import realtime from 'svelte-realtime/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter({ websocket: true }),
			compilerOptions: {
				experimental: {
					async: true
				}
			}
		}),
		uws(),
		realtime()
	]
});
