// jest.config.js
export default {
  // Other Jest configurations...
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx'],
  testEnvironment: 'node',
  // Allow absolute imports
  moduleNameMapper: {
    '^/(.*)$': '<rootDir>/$1',
  },
};
