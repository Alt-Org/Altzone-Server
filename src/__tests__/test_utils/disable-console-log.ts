import './jest.matchers.d';

global.console = {
  ...console,
  //Comment what you need to see in console while testing
  //log: jest.fn(),
  //debug: jest.fn(),
  //info: jest.fn(),
  //warn: jest.fn(),
  //error: jest.fn(),
};
