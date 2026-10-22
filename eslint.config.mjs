import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const COUNT_OPTIONS = { skipBlankLines: true, skipComments: true };

/** Size gates (AIRE implementation rulebook): function at most 30 lines, file at most 400 lines. No exceptions. */

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 400, ...COUNT_OPTIONS }],
      'max-lines-per-function': ['error', { max: 30, IIFEs: false, ...COUNT_OPTIONS }],
    },
  },
  {
    files: ['src/**/__tests__/**', 'src/test/**'],
    rules: { 'max-lines-per-function': 'off' },
  },
];

export default config;
