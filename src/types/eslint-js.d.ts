declare module "@eslint/js" {
   import type { Linter } from "eslint";

   const js: {
      configs: {
         recommended: Linter.Config;
      };
   };

   export default js;
}
