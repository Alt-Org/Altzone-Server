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

@Controller('clan/role')
export class ClanRoleController {
  public constructor(private readonly service: ClanRoleService) {}

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
