module.exports = {
  root: true,
  plugins: ['simple-import-sort', 'import', 'unused-imports'],
  extends: [
    'react-app', // Use the recommended rules from eslint-config-react-app (bundled with Create React App)
    'plugin:react/recommended', // Use the recommended rules from eslint-plugin-react
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier to display Prettier errors as ESLint errors
  ],
  rules: {
    'consistent-return': 'off',
    'no-console': 'off',
    'no-void': 'off',
    'no-plusplus': 'off',
    'no-unused-vars': 'error',
    'max-classes-per-file': 'off',
    'prettier/prettier': 'off',
    'no-restricted-syntax': ['off', 'ForOfStatement'],

    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 'off',

    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    'import/prefer-default-export': 'off',
    // 'import/no-default-export': 'error',

    // sort
    'import/order': 'off',
    'sort-imports': 'off',
    'simple-import-sort/sort': [
      'error',
      {
        groups: [
          ['^\\u0000'], // bare imports
          ['^react'], // react
          ['^[^\\.]'], // non-local imports
          [
            '^constants|^config|^lib|^utils|^types.ts|^store|^api|^app|^pages|^components|^styles|^assets',
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
        'react/display-name': 'off',
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
