import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

const taskReservedError = new ServiceError({
  reason: SEReason.VALIDATION,
  field: 'playerId',
  message: 'Task is already reserved',
});

export { taskReservedError };
