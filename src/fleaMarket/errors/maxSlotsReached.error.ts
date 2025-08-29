import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const maxSlotsReachedError = new ServiceError({
  reason: SEReason.MORE_THAN_MAX,
  message: 'Your clan already has the maximum amount of items for sale.',
});
