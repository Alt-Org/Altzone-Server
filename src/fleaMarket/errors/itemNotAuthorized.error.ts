import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const itemNotAuthorizedError = new ServiceError({
  reason: SEReason.NOT_AUTHORIZED,
  message: 'The item does not belong to the clan of logged in player',
});
