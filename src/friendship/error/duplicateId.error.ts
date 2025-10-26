import { IServiceReturn } from '../../common/service/basicService/IService';
import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export const InvalidIdsServiceError: IServiceReturn<any> = [
  null,
  [
    new ServiceError({
      reason: SEReason.VALIDATION,
      message: 'Matching player ids. You cannot add yourself as a friend.',
    }),
  ],
];
