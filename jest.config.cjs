// jest.config.cjs
module.exports = {
  transform: {
    '^.+\\.m?js$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },

  // babel-jest needs to emit ESM for tests using import()
  globals: {
    'babel-jest': {
      useESM: true
    }
  },

  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/'],
};
