import { envVars } from '../service/envHandler/envVars';

export type ThrottlerProfile = 'default' | 'strict' | 'medium' | 'loose';

// Throttler rate limits (per minute; global throttle TTL is 60000 ms)
// Global default profile is configured as an environment variable
// custom profiles (strict, medium, loose etc.) are configured here
const THROTTLE_LIMIT_DEFAULT = envVars.THROTTLE_LIMIT;
const THROTTLE_LIMIT_STRICT = '10';
const THROTTLE_LIMIT_MEDIUM = '250';
const THROTTLE_LIMIT_LOOSE = '500';

export const rateLimits = {
  default: THROTTLE_LIMIT_DEFAULT,
  strict: THROTTLE_LIMIT_STRICT,
  medium: THROTTLE_LIMIT_MEDIUM,
  loose: THROTTLE_LIMIT_LOOSE,
};
