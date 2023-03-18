import APIError from "./apiError";

export default class UpdateError extends APIError{
    constructor(statusCode: number, msg: string, additional?: Object | unknown) {
        super(statusCode, msg, additional);
        Object.setPrototypeOf(this, UpdateError.prototype);
    }
    type: string = 'UpdateError';
}