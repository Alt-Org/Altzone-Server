import APIError from "./apiError";

export default class CreateError extends APIError{
    constructor(statusCode: number, msg: string, additional?: Object | unknown) {
        super(statusCode, msg, additional);
        Object.setPrototypeOf(this, CreateError.prototype);
    }
    type: string = 'CreateError';
}