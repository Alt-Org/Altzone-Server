import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Clan } from '../clan.schema';
import { Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { ClanRole } from './ClanRole.schema';
import { ObjectId } from 'mongodb';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { CreateClanRoleDto } from './dto/createClanRole.dto';
import { doesRoleWithRightsExists, isRoleNameExists } from './clanRoleUtils';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { ClanRoleType } from './enum/clanRoleType.enum';

/**
 * Manages clan roles
 */
@Injectable()
export default class ClanRoleService {
  public constructor(
    @InjectModel(Clan.name) public readonly model: Model<Clan>,
  ) {
    this.basicService = new BasicService(model);
  }
  public readonly basicService: BasicService;

  /**
   * Creates a new role for a specified clan.
   *
   * Notice that the role name must be unique inside the clan and there should not be a role with exact same rights.
   *
   * @param roleToCreate role that need to be created
   * @param clan_id clan where the role will be created
   *
   * @returns created role on success or ServiceErrors if:
   * - NOT_UNIQUE clan has role with that name or there is a role with the same rights
   * - NOT_FOUND if the clan could not be found
   */
  async createOne(
    roleToCreate: CreateClanRoleDto,
    clan_id: string | ObjectId,
  ): Promise<IServiceReturn<ClanRole>> {
    const [clan, clanReadingErrors] = await this.basicService.readOneById(
      clan_id.toString(),
    );

    if (clanReadingErrors) return [null, clanReadingErrors];

    if (isRoleNameExists(clan.roles, roleToCreate.name))
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'name',
            value: roleToCreate.name,
            message: 'Role with this name already exists',
          }),
        ],
      ];

    if (doesRoleWithRightsExists(clan.roles.toObject(), roleToCreate.rights))
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'rights',
            value: roleToCreate.rights,
            message: 'Role with the same rights already exists',
          }),
        ],
      ];

    const newRole: Omit<ClanRole, '_id'> = {
      ...roleToCreate,
      clanRoleType: ClanRoleType.NAMED,
    };
    const [, clanUpdateErrors] = await this.basicService.updateOneById(
      clan_id.toString(),
      {
        $push: { roles: [newRole] },
      },
    );

    if (clanUpdateErrors) return [null, clanUpdateErrors];

    const [updatedClan] = await this.basicService.readOneById<Clan>(
      clan_id.toString(),
    );
    const createdRole = updatedClan.roles.find(
      (role) => role.name === newRole.name,
    );

    return [createdRole, null];
  }

/**
   * Deletes a ClanRole by its _id from DB.
   * @param clan_id - The Mongo _id of the Clan where from the role to delete.
   * @param role_id - The Mongo _id of the ClanRole to delete.
   * @returns _true_ if ClanRole was removed successfully,
   * or a ServiceError array if the ClanRole was not found or something else went wrong
   */
  async deleteOneById(
    clan_id: string | ObjectId,
    role_id: string | ObjectId,
  ): Promise<[true | null, ServiceError[] | null]> {
    await this.model.updateOne(
      { _id: clan_id },
      { $pull: { roles: { _id: role_id } } },
    );
    return [true, null];
  }
}
