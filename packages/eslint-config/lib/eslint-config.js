'use strict';

module.exports = {
  root: true,
  ignorePatterns: ['dist/', '*.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['simple-import-sort', 'import', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  env: {
    node: true,
  },
  rules: {
    curly: 'error',
    eqeqeq: 'error',
    'import/first': 'warn',
    'import/order': 'off',
    'import/newline-after-import': 'warn',
    'import/no-duplicates': 'warn',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    "no-magic-numbers": "off",
    "require-await": "off",
    'simple-import-sort/exports': 'warn',
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    "@typescript-eslint/require-await": "error",
    '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    // Enforce that private members are prefixed with an underscore
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'require',
      },
    ],

    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          ['^\\u0000'], // bare imports
          ['^react'], // react
          ['^[^\\.]'], // non-local imports
          [
            '^constants|^config|^lib|^utils|^types.ts|^store|^api|^app|^pages|^components|^new|^styles|^assets',
          ], // internal
          ['^\\.'], // local imports
        ],
      },
    ],
    "@typescript-eslint/no-magic-numbers": [
      "warn",
      {
        ignore: [-1, 0, 1],
        ignoreEnums: true,
        ignoreNumericLiteralTypes: true,
        ignoreArrayIndexes: true
      }
    ],

    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-shadow': 'warn',
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-non-null-assertion": 'warn',
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/no-empty-interface": [
      "error",
      {
        "allowSingleExtends": false
      }
    ],
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn',
    '@typescript-eslint/unbound-method': 'warn',
    'no-async-promise-executor': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/restrict-plus-operands': 'warn',
    '@typescript-eslint/ban-types': 'warn',
    'no-prototype-builtins': 'warn',
    'no-constant-condition': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/triple-slash-reference': 'warn',
    '@typescript-eslint/no-namespace': 'warn',
  },
};
