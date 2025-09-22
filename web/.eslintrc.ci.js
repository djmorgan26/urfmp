const config = {
  extends: ['./.eslintrc.cjs'],
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
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.ci.json',
  },
}

module.exports = config