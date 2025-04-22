import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const itemNotInStockError = new ServiceError({
  reason: SEReason.NOT_ALLOWED,
  message: 'Item is not in stock',
});
