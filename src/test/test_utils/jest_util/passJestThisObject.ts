/**
 * Adds a dummy jest _this_ object containing functions 
 * that are available in custom matchers, for example this.utils
 * @param {Function} fn function to which the dummy this object will be bind
 * @returns {Function} same function, but with dummy jest _this_ object available
 */
export default function passJestThis(fn: Function) {
    const jestThisMock = {
        utils: {
            printExpected: (str: string) => str,
            printReceived: (str: string) => str
        }
    } 

    return fn.bind(jestThisMock);
}