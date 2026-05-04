import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

export const votingExpiredError = new ServiceError({
  reason: SEReason.VOTING_EXPIRED,
  message: 'Voting has already ended.',
});