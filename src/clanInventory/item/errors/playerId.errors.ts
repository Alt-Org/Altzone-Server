import { APIError } from '../../../common/controller/APIError';
import { APIErrorReason } from '../../../common/controller/APIErrorReason';

export const IdMismatchError = new APIError({
  reason: APIErrorReason.NOT_AUTHORIZED,
  message: "Steal token doesn't belong to the logged in user",
  field: 'player_id',
});
