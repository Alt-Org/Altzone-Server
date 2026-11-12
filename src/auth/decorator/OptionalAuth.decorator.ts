import { SetMetadata } from '@nestjs/common';

export const OPTIONAL_AUTH = 'optionalAuth';

/**
 * Allows an anonymous request while still validating a supplied access token.
 */
export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH, true);
