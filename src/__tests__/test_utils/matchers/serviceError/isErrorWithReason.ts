import { SEReason } from '../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../common/service/basicService/ServiceError';

/**
 * Checks whenever the error is ServiceError and has the specified reason field
 * @param {*} error error to check
 * @param {*} reason reason the error should have
 * @returns {boolean} _true_ if it is ServiceError with provided reason and _false_ if not
 */
export function isErrorWithReason(error: any, reason: SEReason) {
  if (!(error instanceof ServiceError)) return false;

  return error.reason === reason;
}
