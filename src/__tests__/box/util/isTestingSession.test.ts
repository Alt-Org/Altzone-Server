import { envVars } from '../../../common/service/envHandler/envVars';
import isTestingSession from '../../../box/util/isTestingSession';

describe('isTestingSession() test suite', () => {
  it('Should return true when environment variable is set to TESTING_SESSION', () => {
    envVars.ENVIRONMENT = 'TESTING_SESSION';
    expect(isTestingSession()).toBeTruthy();
  });

  it('Should return false when environment variable is not set to TESTING_SESSION', () => {
    envVars.ENVIRONMENT = 'OTHER_ENVIRONMENT';
    expect(isTestingSession()).toBeFalsy();
  });
});
