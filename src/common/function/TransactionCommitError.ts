import { SEReason } from "../service/basicService/SEReason";
import ServiceError from "../service/basicService/ServiceError";

export default class TransactionCommitError extends ServiceError {
    constructor(cause?: unknown) {
        super({
            reason: SEReason.UNEXPECTED,
            field: null,
            value: null,
            message: 'Failed to commit MongoDB transaction',
            additional: cause,
        });
    }
}