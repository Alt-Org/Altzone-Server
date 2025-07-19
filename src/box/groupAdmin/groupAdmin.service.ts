import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GroupAdmin } from './groupAdmin.schema';
import { Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { CreateGroupAdminDto } from './dto/createGroupAdmin.dto';

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

  /**
   * Create a box admin
   *
   * Notice that it is required for development of teacher pages only, and when they are done, should be removed
   *
   * @param admin admin to create
   *
   * @returns true if it is created or ServiceErrors:
   * - REQUIRED - if the provided admin object is null or undefined, or the password is not provided or an empty string
   * - NOT_UNIQUE - if there are admin with such password already created
   */
  public async createOne(
    admin: CreateGroupAdminDto,
  ): Promise<IServiceReturn<true>> {
    const [isAdminValid, validationErrors] = this.validateAdmin(admin);
    if (validationErrors) return [null, validationErrors];

    const [, creationErrors] = await this.basicService.createOne(admin);

    if (creationErrors) return [null, creationErrors];
    return [true, null];
  }

  /**
   * Validates whenever the provide group admin information is correct
   *
   * @param admin admin to validate
   * @private
   *
   * @returns true if the admin is valid or ServiceError REQUIRED if some of the fields are not valid
   */
  private validateAdmin(admin: CreateGroupAdminDto): IServiceReturn<true> {
    if (!admin)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'admin',
            value: admin,
            message: 'admin parameter is required',
          }),
        ],
      ];

    if (!admin.password)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'password',
            value: admin.password,
            message: 'password field is required',
          }),
        ],
      ];

    return [true, null];
  }
}
