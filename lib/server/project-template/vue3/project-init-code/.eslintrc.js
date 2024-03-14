module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2019,
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: false,
      jsx: true,
    },
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'vue/no-reserved-component-names': 'off',
    'vue/no-deprecated-props-default-this': 'off',
  },
  globals: {
    BKPAAS_ENVIRONMENT: true,
    BK_APP_APIGW_PREFIX: true,
  },
  extends: ['@blueking/eslint-config-bk/vue3'],
};
