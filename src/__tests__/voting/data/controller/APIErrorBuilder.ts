import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { APIError } from '../../../../common/controller/APIError';
import { APIErrorReason } from '../../../../common/controller/APIErrorReason';

export default class APIErrorBuilder
  implements IDataBuilder<APIError>
{
  private readonly base: APIError;

  constructor() {
    this.base = new APIError({
      reason: APIErrorReason.NOT_FOUND,
      statusCode: 0,
      message: '',
      field: '',
      value: '',
      additional: null,
    });
    this.base.name = '';
    this.base.reason = APIErrorReason.NOT_FOUND;
    this.base.statusCode = 0;
    this.base.message = '';
    this.base.field = '';
    this.base.value = '';
    this.base.additional = undefined;
    // Removed assignment to 'status' as it is private and read-only.
    this.base.cause = undefined;
  }

  build(): APIError {
    return new APIError({
      reason: this.base.reason,
      statusCode: this.base.statusCode,
      message: this.base.message,
      field: this.base.field,
      value: this.base.value,
      additional: this.base.additional,
    });
  }
}
