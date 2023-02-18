import svelte from "rollup-plugin-svelte";
import autoPreprocess from "svelte-preprocess";

export default (theme) => ({
   plugins: [
      svelte({
         preprocess: autoPreprocess()
      }),
   ],
});