export default class RequestError extends Error{
    constructor(statusCode: number, msg: string, additional?: Object) {
        super();
        this.message = msg;
        this.statusCode = statusCode;
        this.additional = additional;
        Object.setPrototypeOf(this, RequestError.prototype);
    }
    message: string;
    statusCode: number;
    name: string = 'RequestError';
    additional?: Object;
}
