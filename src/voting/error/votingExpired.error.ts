import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const votingExpiredError = new ServiceError({
  reason: SEReason.NOT_ALLOWED,
  message: 'Voting has expired.',
});
