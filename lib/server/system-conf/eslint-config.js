module.exports = {
    root: true,
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        ecmaFeatures: {
            legacyDecorators: true
        }
    },
    env: {
        browser: true
    },
    globals: {
    },
    extends: ['@blueking/eslint-config-bk/vue3']
}
