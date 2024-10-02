import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
	const isProduction = mode === 'production';
	const isLocal = !isProduction && process.env.NODE_ENV !== 'test';
	const useEmulator = isLocal && process.env.USE_EM === 'true';

	// Set in the npm run dev:emulate command
	console.log(`isProduction: ${isProduction}, isLocal: ${isLocal}, useEmulator: ${useEmulator} `);

	return {
		plugins: [sveltekit()],
		ssr: {
			noExternal: ['three']
		},
		define: {
			'import.meta.env.VITE_USE_EMULATOR': useEmulator
		}
	};
});
