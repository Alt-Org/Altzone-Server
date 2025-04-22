import { SEReason } from '../../../../../common/service/basicService/SEReason';
import MatcherReturner from '../../../jest_util/MatcherReturner';
import { isErrorWithReason } from '../isErrorWithReason';
import type { MatcherFunction } from 'expect';

/**
 * Jest matcher checks whenever provided param is an array
 * containing at least one ServiceError with reason UNEXPECTED
 * @param {*} object object to check
 * @returns {{ message: () => string, pass: boolean }}
 */
export const toContainSE_UNEXPECTED: MatcherFunction<[object: any]> = function (
  object,
) {
  const returner = new MatcherReturner({ received: object, utils: this.utils });

  if (!object || !Array.isArray(object))
    return returner.passFalse('Received object is not array');

  const isValid = object.find((item) =>
    isErrorWithReason(item, SEReason.UNEXPECTED),
  );

  return isValid
    ? returner.passTrue(
        'Expected to not receive an array containing any ServiceErrors with reason UNEXPECTED',
      )
    : returner.passFalse(
        'Expected to receive an array containing at least one ServiceError with reason UNEXPECTED',
      );
};

expect.extend({ toContainSE_UNEXPECTED });
