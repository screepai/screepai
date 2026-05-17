import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";
import svelte from "eslint-plugin-svelte";

const tsRecommendedConfigs = ts.configs["flat/recommended"] as Linter.Config[];

const browserGlobals = {
   customElements: "readonly",
   document: "readonly",
   Element: "readonly",
   HTMLImageElement: "readonly",
   HTMLElement: "readonly",
   Image: "readonly",
   localStorage: "readonly",
   MediaQueryList: "readonly",
   MouseEvent: "readonly",
   setInterval: "readonly",
   setTimeout: "readonly",
   clearInterval: "readonly",
   clearTimeout: "readonly",
   Touch: "readonly",
   TouchEvent: "readonly",
   window: "readonly",
};

const nodeGlobals = {
   console: "readonly",
   module: "readonly",
   process: "readonly",
   require: "readonly",
};

export default [
   {
      ignores: [
         ".svelte-kit/**",
         ".vercel/**",
         "build/**",
         "node_modules/**",
         "package/**",
      ],
   },
   js.configs.recommended,
   ...tsRecommendedConfigs,
   ...svelte.configs["flat/recommended"],
   {
      files: ["**/*.{js,ts,svelte}"],
      languageOptions: {
         ecmaVersion: "latest",
         sourceType: "module",
         globals: {
            ...browserGlobals,
            ...nodeGlobals,
         },
      },
   },
   {
      files: ["**/*.svelte"],
      languageOptions: {
         parserOptions: {
            parser: tsParser,
         },
      },
      rules: {
         "svelte/infinite-reactive-loop": "off",
         "svelte/no-dom-manipulating": "off",
         "svelte/no-navigation-without-resolve": "off",
         "svelte/no-unused-props": "off",
      },
   },
];
