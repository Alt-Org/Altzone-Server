export default class RequestError extends Error{
    constructor(status: number, msg: string, additional?: Object) {
        super(msg);
        this.message = msg;
        this.status = status;
        this.additional = additional;
        Object.setPrototypeOf(this, RequestError.prototype);
    }
    message: string;
    status: number;
    name: string = 'RequestError';
    additional?: Object;
}
