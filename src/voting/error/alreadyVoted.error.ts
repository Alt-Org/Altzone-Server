import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const alreadyVotedError = new ServiceError({
  reason: SEReason.ALREADY_VOTED,
  message: 'Logged in user has already voted.',
});
