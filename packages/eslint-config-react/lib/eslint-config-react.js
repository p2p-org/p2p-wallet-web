"use strict";

module.exports = {
  env: {
    browser: true,
  },
  extends: [
    "@p2p-wallet-web",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  settings: { react: { version: "detect" } },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "@typescript-eslint/no-explicit-any": 'error',
    "@typescript-eslint/no-unused-vars": "error"
  },
};
