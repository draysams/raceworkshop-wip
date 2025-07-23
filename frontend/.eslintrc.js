// .eslintrc.js
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended', //last to override other configs
    ],
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    settings: {
        react: {
            version: 'detect', // Automatically detect the React version
        },
    },
    rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for 'any' type
    },
};