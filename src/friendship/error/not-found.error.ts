import { IServiceReturn } from '../../common/service/basicService/IService';
import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const NotFoundServiceError: IServiceReturn<any> = [
  null,
  [
    new ServiceError({
      reason: SEReason.NOT_FOUND,
      message: 'Could not find any objects with specified condition',
    }),
  ],
];
