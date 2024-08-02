import AddType from "src/common/base/decorator/AddType.decorator";
import { SEReason } from "./SEReason";

/**
 * Constant, which determines the objectType field in ServiceError objects.
 *
 * Used to determine whenever the objects is ServiceError or not
 */
export const SERVICE_ERROR_TYPE = 'ServiceError';

type ServiceErrorArgs = {
    reason?: SEReason,
    field?: string,
    message?: string,
    additional?: any
}
/**
 * The class represents an error occurred on service level
 *
 * The error can relate for example to validation or database errors
 *
 * The ServiceError has following fields:
 * - reason why the error happen, default UNEXPECTED
 * - field with what field there is a problem (usually in validation errors), default null
 * - message optional message to consumer with explanation of the error, default null
 * - additional data to pass farther, which can be useful for the consumer, for example DB error object, default null
 */
@AddType(SERVICE_ERROR_TYPE)
export default class ServiceError{
    constructor({
        reason = SEReason.UNEXPECTED,
        field=null,
        message=null,
        additional=null
    }: ServiceErrorArgs){
        this.reason = reason;
        this.field = field;
        this.message = message;
        this.additional = additional;
    }
    public reason: SEReason;
    public field: string | null;
    public message: string | null;
    public additional: any | null;

    declare objectType: string;
    declare isType: (type: string) => boolean;
}