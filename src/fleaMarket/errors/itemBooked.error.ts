import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';
import { Status } from '../enum/status.enum';

export const ItemBookedError = new ServiceError({
  reason: SEReason.NOT_ALLOWED,
  field: 'status',
  value: Status.BOOKED,
  message: 'Item is booked',
});
