module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:storybook/recommended",
    "plugin:storybook/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@next/next/recommended",
  ],
  plugins: ["@typescript-eslint", "prettier", "unused-imports", "@trivago/prettier-plugin-sort-imports"],
  rules: {
    quotes: [
      "warn",
      "double",
      {
        avoidEscape: true,
      },
    ],
    "prettier/prettier": [
      "error",
      {
        arrowParens: "avoid",
        bracketSpacing: true,
        endOfLine: "auto",
        trailingComma: "es5",
        tabWidth: 2,
        semi: true,
        singleQuote: false,
        printWidth: 120,
      },
    ],
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "off",
    "unused-imports/no-unused-imports": "error",
    "object-shorthand": ["error", "always"],
    "no-trailing-spaces": "error",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@next/next/no-img-element": "off",
  },
  ignorePatterns: [
    "dist/*",
    "test/*",
    "src/assets/animations/*.json",
    "cypress/*",
    "app.json",
    "scripts/*",
    "**/node_modules/*",
    "**/__generated/*",
    "**/e2e/*",
  ],
};
