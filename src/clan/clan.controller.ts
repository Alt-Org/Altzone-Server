import { ClanService } from './clan.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CreateClanDto } from './dto/createClan.dto';
import { UpdateClanDto } from './dto/updateClan.dto';
import { ClanDto } from './dto/clan.dto';
import { _idDto } from '../common/dto/_id.dto';
import { ModelName } from '../common/enum/modelName.enum';
import { Authorize } from '../authorization/decorator/Authorize';
import { Action } from '../authorization/enum/action.enum';
import { AddSearchQuery } from '../common/interceptor/request/addSearchQuery.interceptor';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { AddSortQuery } from '../common/interceptor/request/addSortQuery.interceptor';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { JoinDto } from './join/dto/join.dto';
import { JoinRequestDto } from './join/dto/joinRequest.dto';
import { JoinService } from './join/join.service';
import { RemovePlayerDTO } from './join/dto/removePlayer.dto';
import { PlayerLeaveClanDto } from './join/dto/playerLeave.dto';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { IncludeQuery } from '../common/decorator/param/IncludeQuery.decorator';
import { publicReferences } from './clan.schema';
import { RoomService } from '../clanInventory/room/room.service';
import { ItemService } from '../clanInventory/item/item.service';
import { PlayerService } from '../player/player.service';
import HasClanRights from './role/decorator/guard/HasClanRights';
import { ClanBasicRight } from './role/enum/clanBasicRight.enum';
import DetermineClanId from '../common/guard/clanId.guard';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import { ApiStandardErrors } from '../common/swagger/response/errors/ApiStandardErrors.decorator';
import { ApiSuccessResponse } from '../common/swagger/response/success/ApiSuccessResponse.decorator';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import ClanItemsDto from './dto/clanItems.dto';
import { ApiExtraModels } from '@nestjs/swagger';
import { ItemDto } from '../clanInventory/item/dto/item.dto';
import { ClanChatService } from '../chat/service/clanChat.service';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';

@Controller('clan')
export class ClanController {
  public constructor(
    private readonly service: ClanService,
    private readonly joinService: JoinService,
    private readonly roomService: RoomService,
    private readonly itemService: ItemService,
    private readonly playerService: PlayerService,
    private readonly clanChatService: ClanChatService,
  ) {}

  /**
   * Create a new Clan
   *
   * @remarks The creator of the Clan becomes its admin.
   *
   * Notice that if Player is creating a new Clan, he/she becomes a member of it,
   * that means that if Player is member of some Clan it can not create a new one, before leaving the old one.
   *
   * Also, endpoint creates Clan's Stock, as well as Clan's SoulHome and Rooms.
   *
   * For the created Clan a set of default Items will be added to Stock and to one of the SoulHome Rooms.
   */
  @ApiResponseDescription({
    success: {
      dto: ClanDto,
      status: 201,
      modelName: ModelName.CLAN,
    },
    errors: [400, 401, 403, 409],
  })
  @Post()
  @Authorize({ action: Action.create, subject: ClanDto })
  @UniformResponse(ModelName.CLAN)
  public async create(@Body() body: CreateClanDto, @LoggedUser() user: User) {
    return this.service.createOne(body, user.player_id);
  }

  /**
   * Get items of the logged-in user clan.
   *
   * @remarks Get items of the logged-in user clan.
   *
   * Notice that it will return 403 if the logged-in player is not in any clan.
   */
  @ApiResponseDescription({
    success: {
      dto: ClanItemsDto,
      modelName: ModelName.ITEM,
    },
    errors: [401, 403],
  })
  @ApiExtraModels(ItemDto)
  @Get('items')
  @UniformResponse(ModelName.ITEM, ClanItemsDto)
  async getClanItems(@LoggedUser() user: User) {
    const clanId = await this.playerService.getPlayerClanId(user.player_id);
    const [clan, clanErrors] = await this.service.readOneById(clanId, {
      includeRefs: [...publicReferences],
    });
    if (clanErrors) return clanErrors;
    const [roomIds, roomErrors] = await this.roomService.readAllSoulHomeRooms(
      clan.SoulHome._id,
    );
    if (roomErrors) return roomErrors;
    const [clanItems, itemErrors] = await this.itemService.readMany({
      filter: {
        $or: [{ stock_id: clan.Stock._id }, { room_id: { $in: roomIds } }],
      },
    });
    if (itemErrors) return itemErrors;
    const stockItems = clanItems.filter((item) => item.stock_id);
    const soulHomeItems = clanItems.filter((item) => item.room_id);
    return { stockItems, soulHomeItems };
  }

  /**
   * Get Clan by _id.
   *
   * @remarks Read Clan data by its _id field
   */
  @ApiResponseDescription({
    success: {
      dto: ClanDto,
      modelName: ModelName.CLAN,
    },
    errors: [400, 404],
    hasAuth: false,
  })
  @Get('/:_id')
  @NoAuth()
  @UniformResponse(ModelName.CLAN)
  public get(
    @Param() param: _idDto,
    @IncludeQuery(publicReferences) includeRefs: ModelName[],
  ) {
    return this.service.readOneById(param._id, { includeRefs });
  }

  /**
   * Read all clans.
   *
   * @remarks Read all created Clans
   */
  @ApiResponseDescription({
    success: {
      dto: ClanDto,
      modelName: ModelName.CLAN,
      returnsArray: true,
    },
    errors: [404],
    hasAuth: false,
  })
  @Get()
  @ApiSuccessResponse(ClanDto, {
    modelName: ModelName.CLAN,
    returnsArray: true,
  })
  @ApiStandardErrors(404)
  @NoAuth()
  @UniformResponse(ModelName.CLAN, ClanDto)
  @OffsetPaginate(ModelName.CLAN)
  @AddSearchQuery(ClanDto)
  @AddSortQuery(ClanDto)
  public getAll(@GetAllQuery() query: IGetAllQuery) {
    return this.service.readAll(query);
  }

  /**
   * Update a clan
   *
   * @remarks Update the Clan, which _id is specified in the body.
   *
   * Notice that the player must be in the same clan and it must have a basic right "Edit clan data"
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404, 409],
  })
  @Put()
  @DetermineClanId()
  @HasClanRights([ClanBasicRight.EDIT_CLAN_DATA])
  @UniformResponse()
  public async update(@Body() body: UpdateClanDto, @LoggedUser() user: User) {
    if (user.clan_id.toString() !== body._id.toString())
      return [
        null,
        [
          new APIError({
            reason: APIErrorReason.NOT_AUTHORIZED,
            field: 'clan_id',
            value: user.clan_id,
            message: 'Logged-in player is in another clan',
          }),
        ],
      ];
    const [, errors] = await this.service.updateOneById(body);
    if (errors) return [null, errors];
  }

  /**
   * Delete a clan
   *
   * @remarks Delete Clan its _id field.
   *
   * Notice that only Clan admins can delete the Clan.
   *
   * Notice that the player must be in the same clan and it must have a basic right "Edit clan data"
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404],
  })
  @Delete('/:_id')
  @Authorize({ action: Action.delete, subject: UpdateClanDto })
  @UniformResponse()
  public async delete(@Param() param: _idDto) {
    const [, errors] = await this.service.deleteOneById(param._id);
    if (errors) return [null, errors];
  }

  /**
   * Player requests join to clan
   *
   * @remarks Request to join a Clan.
   *
   * Notice that if the Clan is open the Player will be joined automatically without admin approval.
   *
   * Notice that if the Player was in another Clan then he/she will be removed from the old one and if in this Clan was no other Players, it will be removed.
   */
  @ApiResponseDescription({
    success: {
      dto: JoinDto,
      modelName: ModelName.JOIN,
      status: 201,
    },
    errors: [400, 401, 403, 404],
  })
  @SwaggerTags('Release on 13.07.2025', 'Clan')
  @Post('join')
  public async createJoin(
    @Body() body: JoinRequestDto,
    @LoggedUser() user: User,
  ) {
    return this.joinService.handleJoinRequest(
      body.clanId,
      user.player_id,
      body.password,
    );
  }

  /**
   * Player requests leave a clan
   *
   * @remarks Request to leave a Clan.
   *
   * Notice that Player can leave any Clan without admin approval.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [401, 404],
  })
  @Post('leave')
  @HttpCode(204)
  @Authorize({ action: Action.create, subject: PlayerLeaveClanDto })
  public leaveClan(@Req() request: Request, @LoggedUser() user: User) {
    this.clanChatService.handleLeaveClan(user.player_id, user.clan_id);
    return this.joinService.leaveClan(user.player_id);
  }

  /**
   * Exclude the player from clan.
   *
   * @remarks Request exclude the player from clan.
   *
   * Notice that only Clan admin can remove the Player
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404],
  })
  @Post('exclude')
  @HttpCode(204)
  @DetermineClanId()
  @Authorize({ action: Action.create, subject: RemovePlayerDTO })
  public excludePlayer(
    @Body() body: RemovePlayerDTO,
    @LoggedUser() user: User,
  ) {
    this.clanChatService.handleLeaveClan(user.player_id, user.clan_id);
    return this.joinService.removePlayerFromClan(body.player_id, user.clan_id);
  }
}
