require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  env: {
    browser: true,
  },
  extends: ["@p2p-wallet-web/eslint-config-react"],
  settings: { react: { version: "detect" } },
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "tsconfig.json",
  },
};
