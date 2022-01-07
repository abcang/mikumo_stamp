module.exports = {
  root: true,
  extends: ['eslint:recommended', 'airbnb-base'],
  globals: {
    io: false,
    Vue: false,
    uiv: false,
  },
  plugins: ['import'],
  env: {
    browser: true,
    es6: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  rules: {
    'no-param-reassign': ['error', { props: false }],
  },
};
