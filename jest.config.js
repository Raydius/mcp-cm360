// Load .env file before configuring Jest
require('dotenv').config();

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/setup.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // Silence console output during tests
  silent: false, // Set to true to completely silence console output
  verbose: true,
  // Show more detailed information about skipped tests
  reporters: [
    'default',
    ['jest-summarizing-reporter', { onlyFailures: false, includeSkipped: true }]
  ]
};