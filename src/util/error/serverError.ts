import APIError from "./apiError";

export default class ServerError extends APIError{
    constructor(statusCode: number, msg: string, additional?: Object | unknown) {
        super(statusCode, msg, additional);
        Object.setPrototypeOf(this, ServerError.prototype);
    }
    type: string = 'ServerError';
}