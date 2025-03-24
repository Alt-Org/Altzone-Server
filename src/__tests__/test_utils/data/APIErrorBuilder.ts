import { APIError } from '../../../common/controller/APIError';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';

export default class APIErrorBuilder {
  private readonly base: Partial<APIError> = {
    reason: APIErrorReason.UNEXPECTED,
    statusCode: null,
    message: null,
    field: null,
    value: null,
    additional: null,
  };

  build(): APIError {
    return new APIError({
      reason: this.base.reason!,
      statusCode: this.base.statusCode,
      message: this.base.message,
      field: this.base.field,
      value: this.base.value,
      additional: this.base.additional,
    });
  }

  setReason(reason: APIErrorReason) {
    this.base.reason = reason;
    return this;
  }

  setStatusCode(statusCode: number) {
    this.base.statusCode = statusCode;
    return this;
  }

  setMessage(message: string) {
    this.base.message = message;
    return this;
  }

  setField(field: string) {
    this.base.field = field;
    return this;
  }

  setValue(value: string) {
    this.base.value = value;
    return this;
  }

  setAdditional(additional: any) {
    this.base.additional = additional;
    return this;
  }
}
