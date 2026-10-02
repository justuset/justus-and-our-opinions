// One ESLint flat config for the whole workspace (Phase 2, chunk 00).
// Each block says which files it applies to, so React rules only see the story app and Svelte rules only the graphics app.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
  // Generated output, and the finished Phase 1 artifacts (they have their own conventions)
  globalIgnores([
    '**/node_modules/',
    '**/build/',
    '**/dist/',
    '**/.svelte-kit/',
    '**/.react-router/',
    'prototype/',
    'projects/',
    'docs/',
    '.claude/',
  ]),

  // Every file: JavaScript and TypeScript basics
  js.configs.recommended,
  ts.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // TypeScript already reports undefined names, and knows about types ESLint can't see
      'no-undef': 'off',
    },
  },

  // Story app (React): the Rules of Hooks, and accessibility checks on JSX
  {
    files: ['apps/story/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.recommended],
  },

  // Graphics app (Svelte): Svelte's rules, with TypeScript inside <script lang="ts">
  {
    files: ['apps/graphics/**/*.{js,ts,svelte}'],
    extends: [svelte.configs.recommended],
  },
  {
    files: ['apps/graphics/**/*.svelte', 'apps/graphics/**/*.svelte.ts'],
    languageOptions: {
      parserOptions: { projectService: true, extraFileExtensions: ['.svelte'], parser: ts.parser },
    },
  },

  // Last: turn off every rule that would fight Prettier
  prettier,
  svelte.configs.prettier,
);
