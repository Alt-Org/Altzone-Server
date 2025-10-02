import type { Config } from 'jest';

const root = '<rootDir>';
const codeDir = `${root}/src`;
const testDir = `${root}/src/__tests__`;

const config: Config = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',

  testMatch: [`${testDir}/**/*.test.ts`],
  testPathIgnorePatterns: [`${testDir}/test_utils`],
  collectCoverageFrom: [`${codeDir}/**/*.ts`],
  coverageDirectory: './coverage',
  coverageReporters: ['cobertura'],
  reporters: ['default', 'jest-junit'],

  setupFiles: [
    `${testDir}/test_utils/env.ts`,
    `${testDir}/test_utils/disable-console-log.ts`,
  ],
  setupFilesAfterEnv: [
    `${testDir}/test_utils/before-and-after-tests.ts`,
    `${testDir}/test_utils/global-mocks.ts`,
    `${testDir}/test_utils/add-custom-matchers.ts`,
  ],

  globalSetup: `${testDir}/test_utils/globalSetup.ts`,
  globalTeardown: `${testDir}/test_utils/globalTeardown.ts`,
};

export default config;
