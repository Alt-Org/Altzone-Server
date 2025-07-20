import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GroupAdmin } from './groupAdmin.schema';
import { Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

@Injectable()
export class GroupAdminService {
  constructor(
    @InjectModel(GroupAdmin.name) public readonly model: Model<GroupAdmin>,
  ) {
    this.basicService = new BasicService(model);
  }

  private readonly basicService: BasicService;

  /**
   * Determines whenever the provided password registered in the DB
   *
   * @param passwordToCheck password that need to be checked
   *
   * @return true if the password is registered, false if not or REQUIRED error if provided password is null or undefined
   */
  public async isRegisteredPassword(
    passwordToCheck: string,
  ): Promise<IServiceReturn<boolean>> {
    if (!passwordToCheck)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'passwordToCheck parameter is required',
            field: 'passwordToCheck',
            value: passwordToCheck,
          }),
        ],
      ];

    const [adminInDB, errors] = await this.basicService.readOne({
      filter: { password: passwordToCheck },
    });

    if (adminInDB) return [true, null];

    if (errors && errors[0].reason === SEReason.NOT_FOUND) return [false, null];

    return [null, errors];
  }
}
