module.exports = {
  "root": true,
  "extends": [
    'eslint:recommended',
    'airbnb-base/legacy',
  ],
  "globals": {
    "io": false,
    "Vue": false,
    "uiv": false,
  },
  "parserOptions": {},
  "rules": {
    "space-before-function-paren": ["error", "never"],
    "func-names": 0,
    "vars-on-top": 0,
    "no-param-reassign": 0,
  }
}
