module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-use-before-define': 'off'
//     '@typescript-eslint/class-name-casing': 'warn',
//     '@typescript-eslint/semi': 'warn',
//     curly: 'warn',
//     eqeqeq: 'warn',
//     'no-throw-literal': 'warn',
//     semi: 'off',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint",
    "prettier/standard"
  ]
}
