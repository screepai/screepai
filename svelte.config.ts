import vercel from "@sveltejs/adapter-vercel";
import type { Config } from "@sveltejs/kit";
import { sveltePreprocess } from "svelte-preprocess";

const config: Config = {
	preprocess: sveltePreprocess(),
	kit: {
		adapter: vercel({ runtime: "nodejs20.x" }),
	}
};

export default config;
