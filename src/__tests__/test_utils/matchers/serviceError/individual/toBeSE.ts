import { SEReason } from '../../../../../common/service/basicService/SEReason';
import ServiceError from '../../../../../common/service/basicService/ServiceError';
import MatcherReturner from '../../../jest_util/MatcherReturner';
import { isErrorWithReason } from '../isErrorWithReason';
import isSEReason from '../isSEReason';
import type { MatcherFunction } from 'expect';

/**
 * Jest matcher checks whenever object has the provided ServiceError reason or not.
 * @param {*} received object to check
 * @param {SEReason} expected expected ServiceError reason
 * @returns {{ message: () => string, pass: boolean }}
 */
export const toBeSE: MatcherFunction<[expected: SEReason]> = function (
  received,
  expected,
) {
  if (!isSEReason(expected))
    throw new TypeError('The expected value must be of type SEReason');

  const returner = new MatcherReturner({
    received,
    utils: this.utils,
    expected,
  });

  if (!(received instanceof ServiceError))
    return returner.passFalse('Received object is not of type ServiceError');

  const isValid = isErrorWithReason(received, expected);

  return isValid
    ? returner.passTrue(
        `Expected to not receive a ServiceError with reason ${expected}`,
      )
    : returner.passFalse(
        `Expected to receive ServiceError with reason ${expected}`,
      );
};

expect.extend({ toBeSE });
