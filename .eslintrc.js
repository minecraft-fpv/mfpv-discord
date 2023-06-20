module.exports = {
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "semi": 0,
    "no-console": 0,
    "no-unused-vars": 0,
    "no-undef": 0,
    "no-multiple-empty-lines": 0,
    "no-debugger": "error",
    "import/no-unresolved": [2, {
      "commonjs": true
    }]
  },
  "plugins": [
    "import",
  ]
}