module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ['./build/static/js/**'],
  extends: ['plugin:react/recommended', 'airbnb', 'react-app'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'guard-for-in': 'off',
    'max-len': ['warn', 120, 2],
    'react/forbid-prop-types': 'warn',
    'react/jsx-props-no-spreading': 'warn',
    'import/no-named-as-default': 'off',
    'no-console': 'warn',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@Components', './src/components'],
          ['@Assets', './src/assets'],
          ['@Views', './src/views'],
          ['@App', './src'],
        ],
        extensions: ['.ts', '.js', '.jsx', '.json', '.svg', 'webp'],
      },
    },
  },
};
