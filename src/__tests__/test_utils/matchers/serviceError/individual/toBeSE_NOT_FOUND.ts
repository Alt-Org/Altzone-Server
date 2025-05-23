import { SEReason } from '../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../common/service/basicService/ServiceError';
import MatcherReturner from '../../../jest_util/MatcherReturner';
import { isErrorWithReason } from '../isErrorWithReason';
import type { MatcherFunction } from 'expect';

/**
 * Jest matcher checks whenever provided param is ServiceError with reason NOT_FOUND
 * @param {*} object object to check
 * @returns {{ message: () => string, pass: boolean }}
 */
export const toBeSE_NOT_FOUND: MatcherFunction<[object: any]> = function (
  object,
) {
  const returner = new MatcherReturner({ received: object, utils: this.utils });

  if (!(object instanceof ServiceError))
    return returner.passFalse('Received object is not of type ServiceError');

  const isValid = isErrorWithReason(object, SEReason.NOT_FOUND);

  return isValid
    ? returner.passTrue(
        'Expected to not receive a ServiceError with reason NOT_FOUND',
      )
    : returner.passFalse(
        'Expected to receive ServiceError with reason NOT_FOUND',
      );
};

expect.extend({ toBeSE_NOT_FOUND });
