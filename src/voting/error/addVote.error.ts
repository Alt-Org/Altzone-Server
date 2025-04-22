import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const addVoteError = new ServiceError({
  reason: SEReason.UNEXPECTED,
  message: 'Error adding the vote',
});
