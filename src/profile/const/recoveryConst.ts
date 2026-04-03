import { StringValue } from 'ms'

/**
 * Recovery constants
 */
type RecoveryConstants = {
  tokenTime: StringValue;
  maxAttempts: number;
  lockoutTime: number;
}

/**
 * Constants used in the password recovery flow
 */
export const RecoveryConstants: RecoveryConstants = {
  tokenTime: '15m',
  maxAttempts: 5,
  lockoutTime: 60 * 60 * 1000
}
