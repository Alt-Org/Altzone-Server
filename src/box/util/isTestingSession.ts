import { envVars } from '../../common/service/envHandler/envVars';

/**
 * Determines whenever the API runs in testing session environment
 *
 * @return true if in testing environment or false if not
 */
export default function isTestingSession() {
  return envVars.ENVIRONMENT === 'TESTING_SESSION';
}
