import isSEReason from './isSEReason';

/**
 * Checks whenever the provided value is an array of SEErrors or not.
 * @param {*} value value to check
 * @returns {boolean} _true_ if the provided value is array of SEReasons and _false_ if not.
 */
export default function isSEReasonArray(value: any) {
  if (!value || !Array.isArray(value)) return false;

  let isValid = true;
  for (let i = 0, l = value.length; i < l; i++) {
    if (!isSEReason(value[i])) {
      isValid = false;
      break;
    }
  }

  return isValid;
}
