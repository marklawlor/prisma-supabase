module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "@cspell"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "prettier",
    "plugin:@cspell/recommended",
  ],
  env: {
    node: true,
  },
  ignorePatterns: ["dist/*"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { ignoreRestSiblings: true },
    ],
    "unicorn/prevent-abbreviations": [
      "error",
      {
        allowList: {
          args: true,
          prop: true,
          params: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ["*rc.js", "*.config.js"],
      rules: {
        "unicorn/prefer-module": "off",
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
