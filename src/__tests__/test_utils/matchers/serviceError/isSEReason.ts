import { SEReason } from "../../../../common/service/basicService/SEReason";

/**
 * Checks whenever the provided value is SEReason or not
 * @param {*} value value to check
 * @returns {boolean} _true_ id the value is SEReason and _false_ if not
 */
export default function isSEReason(value: any) {
    if(!value || typeof value !== 'string')
        return false;

    return Object.values<string>(SEReason).includes(value);
}