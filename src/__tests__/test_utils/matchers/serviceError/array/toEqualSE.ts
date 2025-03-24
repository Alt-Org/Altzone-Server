import { SEReason } from '../../../../../common/service/basicService/SEReason';
import MatcherReturner from '../../../jest_util/MatcherReturner';
import isSEReasonArray from '../isSEErrorArray';
import type { MatcherFunction } from 'expect';

/**
 * Jest matcher checks whenever provided object is an array
 * containing only errors with specified ServiceErrors reasons.
 *
 * Notice that the order does not matter.
 *
 * Notice that array with other objects or ServiceErrors with other reasons are considered as falsy.
 *
 * @param {*} object object to check
 * @param {SEReason[]} expected expected reasons
 * @returns {{ message: () => string, pass: boolean }}
 */
export const toEqualSE: MatcherFunction<[expected: SEReason[]]> = function (
  object,
  expected,
) {
  if (!isSEReasonArray(expected))
    throw new TypeError('The expected value must be array of SEReasons');

  const returner = new MatcherReturner({
    received: object,
    utils: this.utils,
    expected,
  });

  if (!object || !Array.isArray(object))
    return returner.passFalse('Received object is not an array');

  if (object.length !== expected.length)
    return returner.passFalse(
      'Received array contains less items than expected',
    );

  let isValid = true;

  for (let i = 0, l = object.length; i < l; i++) {
    const error = object[i];
    const reason = error?.reason;

    if (!expected.includes(reason)) {
      isValid = false;
      break;
    }
  }

  return isValid
    ? returner.passTrue(
        'Expected to not receive an array containing these ServiceErrors',
      )
    : returner.passFalse(
        'Expected to receive an array containing these ServiceErrors',
      );
};

expect.extend({ toEqualSE });
