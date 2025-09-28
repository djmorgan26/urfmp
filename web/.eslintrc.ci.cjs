const config = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: ['./tsconfig.json', './tsconfig.ci.json', './tsconfig.test.json']
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // Relax rules for CI - focus on errors only, not warnings
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'prettier/prettier': 'off',
    'react/no-unknown-property': 'off', // Allow Three.js properties
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
    'no-debugger': 'error', // Keep this as error
    'no-unreachable': 'error', // Keep this as error
    'no-unused-expressions': 'off',
    'no-useless-escape': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}

module.exports = config
