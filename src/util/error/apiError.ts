export default abstract class APIError extends Error{
    protected constructor(statusCode: number, message: string, additional?: Object | unknown) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.additional = additional;
        Object.setPrototypeOf(this, APIError.prototype);
    }
    message: string;
    statusCode: number;
    type: string = 'APIError';
    additional?: Object | unknown;
}