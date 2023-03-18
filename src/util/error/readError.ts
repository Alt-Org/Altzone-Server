import APIError from "./apiError";

export default class ReadError extends APIError{
    constructor(statusCode: number, msg: string, additional?: Object | unknown) {
        super(statusCode, msg, additional);
        Object.setPrototypeOf(this, ReadError.prototype);
    }
    type: string = 'ReadError';
}