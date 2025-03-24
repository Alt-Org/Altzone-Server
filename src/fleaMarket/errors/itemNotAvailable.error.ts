import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const itemNotAvailableError = new ServiceError({
  reason: SEReason.NOT_ALLOWED,
  field: 'status',
  message: 'item is not available',
});
