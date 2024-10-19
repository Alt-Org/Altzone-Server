import { SEReason } from "../../../../../common/service/basicService/SEReason";
import MatcherReturner from "../../../jest_util/MatcherReturner";
import { isErrorWithReason } from "../isErrorWithReason";
import type {MatcherFunction} from 'expect';

/**
 * Jest matcher checks whenever provided param is an array 
 * containing at least one ServiceError with reason NOT_ALLOWED
 * @param {*} object object to check
 * @returns {{ message: () => string, pass: boolean }}
 */
export const toContainSE_NOT_ALLOWED: MatcherFunction<[object: any]> = function (object) {
    const returner = new MatcherReturner({received: object, utils: this.utils});

    if(!object || !Array.isArray(object))
        return returner.passFalse('Received object is not array');
    
    const isValid = object.find(item => isErrorWithReason(item, SEReason.NOT_ALLOWED));

    return isValid ?
        returner.passTrue('Expected to not receive an array containing any ServiceErrors with reason NOT_ALLOWED') :
        returner.passFalse('Expected to receive an array containing at least one ServiceError with reason NOT_ALLOWED')
}

expect.extend({toContainSE_NOT_ALLOWED});