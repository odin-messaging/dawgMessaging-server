export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'lib/**/*.js',
    '!**/*.test.js',
  ],
  // testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
    testMatch: ['**/__tests__/**/api.test.js', '**/api.test.js'],

  transform: {},

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',   // allow import './foo' instead of './foo.js'
  },
}