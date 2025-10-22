import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          ignoreRestArgs: false,
          fixToUnknown: false,
        },
      ],
      'no-control-regex': 'off', // Allow control chars in regex for validation
    },
  },
  {
    files: ['src/types/errors.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for Error.captureStackTrace
    },
  },
);
