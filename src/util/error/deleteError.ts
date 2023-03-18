import APIError from "./apiError";

export default class DeleteError extends APIError{
    constructor(statusCode: number, msg: string, additional?: Object | unknown) {
        super(statusCode, msg, additional);
        Object.setPrototypeOf(this, DeleteError.prototype);
    }
    type: string = 'DeleteError';
}