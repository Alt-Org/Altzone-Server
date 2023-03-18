import APIError from "./apiError";

export default class ValidationError extends APIError{
    constructor(statusCode: number, msg: string, additional?: Object | unknown) {
        super(statusCode, msg, additional);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    type: string = 'ValidationError';
}