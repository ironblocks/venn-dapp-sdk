module.exports = {
    root: true,
    env: {
      node: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      project: "./tsconfig.json",
    },
    plugins: ["@typescript-eslint", "prettier", "simple-import-sort"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
    ],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      'arrow-parens': 0,
      'no-debugger': 1,
      'no-warning-comments': [
        1,
        {
          terms: ['hardcoded'],
          location: 'anywhere',
        },
      ],
      'no-console': [
        1,
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-return-await': 0,
      'object-curly-spacing': ['error', 'always'],
      'no-var': 'error',
      'comma-dangle': [1, 'always-multiline'],
      'linebreak-style': ['error', 'unix'],
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  };