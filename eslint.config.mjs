import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' }
  },
  {
    files: ['tests/setup.tsx'],
    rules: { '@next/next/no-img-element': 'off' }
  },
  globalIgnores(['.next/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'])
])
