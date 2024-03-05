module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      ecmaVersion: 6,
      jsx: true
    }
  },
  env: {
    browser: true,
    jest: true,
    node: true,
    es6: true
  },
  extends: ['prettier', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    semi: [2, 'always'],
    'no-unused-vars': 'error',
    'no-trailing-spaces': 'error',
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'off',
    'jest/valid-expect': 'off',
    'promise/always-return': 'off',
    'no-underscore-dangle': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 2,
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ]
  }
};
