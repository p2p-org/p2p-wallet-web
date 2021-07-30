module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  plugins: ['simple-import-sort'],
  rules: {
    'consistent-return': 'off',
    'no-console': 'off',
    'no-void': 'off',
    'no-plusplus': 'off',
    'no-unused-vars': 'error',
    'unicorn/no-null': 'off',
    'unicorn/prefer-ternary': 'off',
    'max-classes-per-file': 'off',
    'prettier/prettier': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-misused-promises': [
      'off',
      {
        checks: ['void-return'],
      },
    ],
    'no-restricted-syntax': ['off', 'ForOfStatement'],

    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 'off',

    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',

    // Not a standard in React world
    'unicorn/filename-case': 'off',

    // Common abbreviations are known and readable
    'unicorn/prevent-abbreviations': 'off',

    // sort
    'sort-imports': 'off',
    'import/order': 'off',
    'simple-import-sort/sort': [
      'error',
      {
        groups: [
          ['^\\u0000'], // bare imports
          ['^react'], // react
          ['^[^\\.]'], // non-local imports
          [
            '^constants|^config|^lib|^utils|^types|^store|^api|^features|^pages|^components|^styles|^assets',
          ], // internal
          ['^\\.'], // local imports
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/state-in-constructor': 'off',

        // No jsx extension: https://github.com/facebook/create-react-app/issues/87#issuecomment-234627904
        'react/jsx-filename-extension': 'off',

        'react/static-property-placement': [
          'warn',
          'property assignment',
          {
            defaultProps: 'static public field',
          },
        ],
      },
    },
  ],
};
