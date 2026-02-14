export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'lib/**/*.js',
    '!**/*.test.js',
  ],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  transform: {},
};
