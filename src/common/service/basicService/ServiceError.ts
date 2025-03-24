import AddType, {
  isType,
} from '../../../common/base/decorator/AddType.decorator';
import { SEReason } from './SEReason';

/**
 * Constant, which determines the objectType field in ServiceError objects.
 *
 * Used to determine whenever the objects is ServiceError or not
 */
export const SERVICE_ERROR_TYPE = 'ServiceError';

type ServiceErrorArgs = {
  /**
   * Why the error is happen
   * @default SEReason.UNEXPECTED
   */
  reason?: SEReason;
  /**
   * On what field the error happen (if the field is possible to define), mostly used for validation errors
   * @default null
   */
  field?: string;
  /**
   * Value of the field (only if the field is specified), mostly used for validation errors
   * @default null
   */
  value?: any;
  /**
   * Message should specify why error happen, mostly used for other developers "FYI"
   * @default null
   */
  message?: string;
  /**
   * Any additional data to provide.
   * For example if the error is thrown by some method and is UNEXPECTED, when this field should contain the thrown error
   * @default null
   */
  additional?: any;
};

/**
 * The class represents an error occurred on service level or in other words inside the API logic.
 *
 * The error can relate for example to validation or database errors
 */
@AddType(SERVICE_ERROR_TYPE)
export default class ServiceError {
  constructor({
    reason = SEReason.UNEXPECTED,
    field = null,
    value = null,
    message = null,
    additional = null,
  }: ServiceErrorArgs) {
    this.reason = reason;
    this.field = field;
    this.value = value;
    this.message = message;
    this.additional = additional;
  }
  /**
   * Why the error is happen
   */
  public reason: SEReason;
  /**
   * On what field the error happen (if the field is possible to define), mostly used for validation errors
   */
  public field: string | null;
  /**
   * Value of the field (only if the field is specified), mostly used for validation errors
   */
  public value: any | null;
  /**
   * Message should specify why error happen, mostly used for other developers "FYI"
   */
  public message: string | null;
  /**
   * Any additional data to provide.
   * For example if the error is thrown by some method and is UNEXPECTED,
   * when this field should contain the thrown error
   */
  public additional: any | null;
}

/**
 * Determines whenever the specified object or array is ServiceError or not.
 *
 * In case the item is an array, it will check whenever the first item of an array is a ServiceError or not
 * @param item object or array to check
 * @returns _true_ if object is ServiceError or array contains ServiceError objects, _false_ if not
 */
export function isServiceError(item: any | any[]) {
  if (Array.isArray(item)) return isType(item[0], SERVICE_ERROR_TYPE);

  return isType(item, SERVICE_ERROR_TYPE);
}
