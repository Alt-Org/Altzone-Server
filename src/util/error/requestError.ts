import APIError from "./apiError";

export default class RequestError extends APIError{
    constructor(statusCode: number, msg: string, additional?: Object | unknown) {
        super(statusCode, msg, additional);
        Object.setPrototypeOf(this, RequestError.prototype);
    }
    type: string = 'RequestError';
}