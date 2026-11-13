import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'dev-dist',
    'android/**/build',
    'ios/App/App/public',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Existing Simple Dinners code predates the React Compiler-oriented
      // lint rules shipped by newer eslint-plugin-react-hooks releases.
      // Keep these out of the baseline until compiler adoption is deliberate.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/immutability': 'off',

      // This is widespread legacy typing debt. New work should still prefer
      // concrete types, but enabling this globally would make lint unusable.
      '@typescript-eslint/no-explicit-any': 'off',

      // Several context/helper modules intentionally colocate exports with
      // components. This is a dev-refresh optimization, not correctness.
      'react-refresh/only-export-components': 'off',
    },
  },
])
