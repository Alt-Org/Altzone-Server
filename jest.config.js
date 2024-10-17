const root = '<rootDir>'
const codeDir = `${root}/src`;
const testDir = `${root}/src/test`;

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  
  verbose: true,
    //Get test coverage
    // collectCoverage: true,
    // collectCoverageFrom: [
    //     `${codeDir}/**/*.ts`
    // ],

    //Run test from this folder(s) only
    testMatch: [
        `${testDir}/**/*.test.ts`
    ],

    // transform: {
    //     "^.+\\.[t|j]sx?$": "babel-jest"
    // },
    setupFiles: [
        `${testDir}/test_utils/env.ts`,
        `${testDir}/test_utils/disable-console-log.ts`
    ],
    setupFilesAfterEnv: [
        `${testDir}/test_utils/connect-to-db.ts`
    ],

    globalSetup: `${testDir}/test_utils/globalSetup.ts`,
    globalTeardown: `${testDir}/test_utils/globalTeardown.ts`,
};