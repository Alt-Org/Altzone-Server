import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
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

  @Delete('/:_id')
  @HasClanRights([ClanBasicRight.MANAGE_ROLE])
  @DetermineClanId()
  @UniformResponse()
  public async delete(@Param() param: _idDto, @LoggedUser() user: User) {
    const [, errors] = await this.service.deleteOneById(user?.clan_id, param?._id);
    if (errors) return [null, errors];
  }
}