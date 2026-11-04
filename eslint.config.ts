import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";
import svelte from "eslint-plugin-svelte";
import globals from "globals";

const tsRecommendedConfigs = ts.configs["flat/recommended"] as Linter.Config[];

export default [
   {
      ignores: [".svelte-kit/**", ".vercel/**", "build/**", "node_modules/**", "package/**"],
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
            ...globals.browser,
            ...globals.node,
         },
      },
   },
   {
      files: ["**/*.{ts,svelte}"],
      rules: {
         "no-undef": "off",
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
