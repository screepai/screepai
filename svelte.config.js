import vercel from "@sveltejs/adapter-vercel";
import { sveltePreprocess } from 'svelte-preprocess'

/** @type {import("@sveltejs/kit").Config} */
const config = {
	preprocess: sveltePreprocess(),
	kit: {
		adapter: vercel({ runtime: "nodejs20.x" }),
	}
};

export default config;
