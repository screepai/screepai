import vercel from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
   plugins: [
      sveltekit({
         adapter: vercel({ runtime: "nodejs24.x" }),
         inlineStyleThreshold: 100000,
      }),
   ],
});
