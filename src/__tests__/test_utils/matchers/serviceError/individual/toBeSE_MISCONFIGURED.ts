import { SEReason } from '../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../common/service/basicService/ServiceError';
import MatcherReturner from '../../../jest_util/MatcherReturner';
import { isErrorWithReason } from '../isErrorWithReason';
import type { MatcherFunction } from 'expect';

/**
 * Jest matcher checks whenever provided param is ServiceError with reason MISCONFIGURED
 * @param {*} object object to check
 * @returns {{ message: () => string, pass: boolean }}
 */
export const toBeSE_MISCONFIGURED: MatcherFunction<[object: any]> = function (
  object,
) {
  const returner = new MatcherReturner({ received: object, utils: this.utils });

  if (!(object instanceof ServiceError))
    return returner.passFalse('Received object is not of type ServiceError');

  const isValid = isErrorWithReason(object, SEReason.MISCONFIGURED);

  return isValid
    ? returner.passTrue(
        'Expected to not receive a ServiceError with reason MISCONFIGURED',
      )
    : returner.passFalse(
        'Expected to receive ServiceError with reason MISCONFIGURED',
      );
};

expect.extend({ toBeSE_MISCONFIGURED });
