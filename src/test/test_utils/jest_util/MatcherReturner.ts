/**
 * Class for helping to return appropriate responses for jest custom matchers
 */
export default class MatcherReturner{
    /**
     * 
     * @param {Object=} [param0] - The parameters object.
     * @param {any} [param0.expected] - The expected value to receive.
     * @param {any} [param0.received] - The received value.
     * @param {any} [param0.utils] - Utils object from jest this
     */
    constructor({ expected, received, utils }: {expected?: any, received?: any, utils?: any} = {}){
        this.expected = expected;
        this.received = received;
        this.utils = utils;
    }
    private expected: any;
    private received: any;
    private utils: any;

    /**
     * Returns an object required for jest matcher function 
     * to return with field pass set to false 
     * @param {string} message message to print
     * @param {{ onlyMessage?: boolean, expected?: any }=} options options for some additional info to print
     * @returns {{ pass: false, message: () => string }}
    */
    passFalse(message: string, options?: { onlyMessage?: boolean, expected?: any }) {
        const messageToPrint = this.determineMessageToPrint(message, options);
        
        return {
            message: () => messageToPrint,
            pass: false
        }
    }

    /**
     * Returns an object required for jest matcher function 
     * to return with field pass set to true 
     * @param {string} message message to print
     * @param {{ onlyMessage?: boolean, expected?: any }=} options options for some additional info to print
     * @returns {{ pass: true, message: () => string }}
    */
    passTrue(message: string, options?: { onlyMessage?: boolean, expected?: any }) {
        const messageToPrint = this.determineMessageToPrint(message, options);
    
        return {
            message: () => messageToPrint,
            pass: true
        }
    }

    /**
     * Returns an appropriate message to print 
     * based on the class state and provided param
     * @param {string} message message to print
     * @param {{ onlyMessage?: boolean, expected?: any }=} options options for some additional info to print
     * @returns {string}
    */
    private determineMessageToPrint(message: string, options?: { onlyMessage?: boolean, expected?: any }){
        if((options && options.onlyMessage) || !this.utils)
            return message;

        let messageToPrint = message;

        const expected = options?.expected ?? this.expected;

        const expectedMsg = expected ? `\nExpected ${this.utils.printReceived(expected)}` : '';
        const receivedMsg = this.received ? `\nReceived ${this.utils.printExpected(this.received)}\n` : '';

        return message + expectedMsg + receivedMsg;
    }
}