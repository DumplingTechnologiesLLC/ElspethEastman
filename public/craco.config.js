const path = require('path');

module.exports = {
  jest: {
    configure: {
      moduleNameMapper: {
        '^@Components/(.*)$': '<rootDir>/src/components/$1',
        '^@App/(.*)$': '<rootDir>/src/$1',
        '^@Assets/(.*)$': '<rootDir>/src/assets/$1',
        '^@Views/(.*)$': '<rootDir>/src/views/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/src/devDeps/setupTests.js'],
    },
  },
  webpack: {
    alias: {
      '@Components': path.resolve(__dirname, './src/components'),
      '@App': path.resolve(__dirname, './src'),
      '@Assets': path.resolve(__dirname, './src/assets'),
      '@Views': path.resolve(__dirname, './src/views'),
    },
  },
};
