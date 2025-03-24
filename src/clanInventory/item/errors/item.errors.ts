import { SEReason } from '../../../common/service/basicService/SEReason';
import ServiceError from '../../../common/service/basicService/ServiceError';

export const NotFoundError = new ServiceError({
  reason: SEReason.NOT_FOUND,
  message: "Item or destination doesn't belong you your clan",
});
