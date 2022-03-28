'use strict';

require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['@p2p-wallet-web/eslint-config-react'],
  ignorePatterns: ['*.js'],
  parserOptions: {
    project: 'tsconfig.json',
  },
  rules: {
    curly: 'error',
  },
};
