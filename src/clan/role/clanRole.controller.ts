import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { ModelName } from '../../common/enum/modelName.enum';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { User } from '../../auth/user';
import HasClanRights from './decorator/guard/HasClanRights';
import { ClanBasicRight } from './enum/clanBasicRight.enum';
import ClanRoleDto from './dto/clanRole.dto';
import ClanRoleService from './clanRole.service';
import { CreateClanRoleDto } from './dto/createClanRole.dto';
import DetermineClanId from '../../common/guard/clanId.guard';
import { _idDto } from '../../common/dto/_id.dto';
import { SEReason } from '../../common/service/basicService/SEReason';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { UpdateClanRoleDto } from './dto/updateClanRole.dto';
import ServiceError from '../../common/service/basicService/ServiceError';
import SetClanRoleDto from './dto/setClanRole.dto';
import SwaggerTags from '../../common/swagger/tags/SwaggerTags.decorator';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';

@SwaggerTags('Clan')
@Controller('clan/role')
export class ClanRoleController {
  public constructor(private readonly service: ClanRoleService) {}

  /**
   * Create a new clan role.
   *
   * @remarks Create a new clan role.
   *
   * Notice that in order to create a new role clan member must have a basic right "Manage role".
   *
   * The role must also be unique in a clan, unique name and unique rights.
   */
  @ApiResponseDescription({
    success: {
      dto: ClanRoleDto,
      modelName: ModelName.CLAN,
      status: 201,
    },
    errors: [400, 401, 403, 404, 409],
  })
  @Post()
  @HasClanRights([ClanBasicRight.MANAGE_ROLE])
  @DetermineClanId()
  @UniformResponse(ModelName.CLAN, ClanRoleDto)
  public async create(
    @Body() body: CreateClanRoleDto,
    @LoggedUser() user: User,
  ) {
    return this.service.createOne(body, user.clan_id);
  }

  /**
   * Update a clan role.
   *
   * @remarks Update a clan role.
   *
   * Notice that in order to update a role, clan member must have a basic right "Manage role".
   *
   * The role must also be unique in a clan, unique name and unique rights.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404, 409],
  })
  @Put()
  @HasClanRights([ClanBasicRight.MANAGE_ROLE])
  @DetermineClanId()
  @UniformResponse(ModelName.CLAN, ClanRoleDto)
  public async update(
    @Body() body: UpdateClanRoleDto,
    @LoggedUser() user: User,
  ) {
    const [, errors] = await this.service.updateOneById(body, user.clan_id);

    return this.handleErrorReturnIfFound(errors);
  }

  /**
   * Delete clan role by _id
   *
   * @remarks Delete a clan role.
   *
   * Notice that in order to delete a role, clan member must have a basic right "Manage role".
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404, 409],
  })
  @Delete('/:_id')
  @HasClanRights([ClanBasicRight.MANAGE_ROLE])
  @DetermineClanId()
  @UniformResponse()
  public async delete(@Param() param: _idDto, @LoggedUser() user: User) {
    const [, errors] = await this.service.deleteOneById(
      user?.clan_id,
      param?._id,
    );

    return this.handleErrorReturnIfFound(errors);
  }

  /**
   * Set a role for a clan member
   *
   * @remarks Set a default or named role to a specified clan member.
   *
   * Notice that the role giver and the clan member must be in the same clan. Also the giver must have the basic clan role "Edit member rights"
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404],
  })
  @Put('set')
  @HasClanRights([ClanBasicRight.EDIT_MEMBER_RIGHTS])
  @DetermineClanId()
  @UniformResponse()
  public async setRole(@Body() body: SetClanRoleDto) {
    const [, errors] = await this.service.setRoleToPlayer(body);
    return this.handleErrorReturnIfFound(errors);
  }

  /**
   * Checks if the errors exists returns them.
   *
   * Notice that if found an error, which should be NOT_AUTHORIZED APIError, its reason will be changed.
   *
   * @param errorsReturned returned errors
   * @private
   * @returns errors if found or nothing if not
   */
  private handleErrorReturnIfFound(errorsReturned: ServiceError[]) {
    if (
      errorsReturned &&
      errorsReturned[0].field === 'clanRoleType' &&
      errorsReturned[0].reason === SEReason.NOT_ALLOWED
    ) {
      return [
        null,
        [
          new APIError({
            ...errorsReturned[0],
            reason: APIErrorReason.NOT_AUTHORIZED,
          }),
        ],
      ];
    }

    if (errorsReturned) return [null, errorsReturned];
  }
}
