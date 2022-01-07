module.exports = {
  root:true,
  extends: ["eslint:recommended", "airbnb-base"],
  plugins: ["import"],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
};
