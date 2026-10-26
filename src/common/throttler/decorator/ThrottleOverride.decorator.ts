import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { envVars } from '../../service/envHandler/envVars';
import { rateLimits, ThrottlerProfile } from '../throttler.config';

const TTL_DEFAULT = envVars.THROTTLE_TTL;

/**
 * Applies "@Throttle" decorator with custom settings (overrides default global Throttle)
 *
 * @param setting which rate limit profile to apply (default: global setting)
 * @returns "@Throttle({ default: { ... } })"
 */
export const ThrottleOverride = (profile: ThrottlerProfile = 'default') => {
  switch (profile) {
    case 'strict':
      return applyThrottle(rateLimits.strict);
    case 'medium':
      return applyThrottle(rateLimits.medium);
    case 'loose':
      return applyThrottle(rateLimits.loose);
    default:
      return applyThrottle(rateLimits.default);
  }
};

/**
 * Helper method that return Throttle decorator with custom settings
 *
 * @param limit - the rate limit value within default TTL (1 minute)
 * @returns - "@Throttle({ default: { ... } })"
 */
const applyThrottle = (limit: string) => {
  return applyDecorators(
    Throttle({
      default: {
        limit: parseInt(limit),
        ttl: parseInt(TTL_DEFAULT),
      },
    }),
  );
};
