import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemDto } from './dto/item.dto';
import { StealTokenGuard } from './guards/StealToken.guard';
import { StealToken } from './decorator/param/StealToken.decorator';
import { StealToken as stealToken } from './type/stealToken.type';
import { SoulHomeService } from '../soulhome/soulhome.service';
import { IdMismatchError } from './errors/playerId.errors';
import { SoulHomeDto } from '../soulhome/dto/soulhome.dto';
import { RoomService } from '../room/room.service';
import { User } from '../../auth/user';
import { Authorize } from '../../authorization/decorator/Authorize';
import { Action } from '../../authorization/enum/action.enum';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { _idDto } from '../../common/dto/_id.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import { ItemHelperService } from './itemHelper.service';
import { UpdateItemDto } from './dto/updateItem.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player } from '../../player/schemas/player.schema';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';

@Controller('item')
export class ItemController {
  public constructor(
    private readonly itemService: ItemService,
    private readonly itemHelper: ItemHelperService,
    private readonly soulHomeService: SoulHomeService,
    private readonly roomService: RoomService,
    @InjectModel(ModelName.PLAYER) private readonly playerModel: Model<Player>,
  ) {}

  @Get('steal')
  @Authorize({ action: Action.read, subject: SoulHomeDto })
  @UseGuards(StealTokenGuard)
  @UniformResponse(ModelName.SOULHOME)
  public async getSoulHome(
    @StealToken() stealToken: stealToken,
    @LoggedUser() user: User,
  ) {
    if (stealToken.playerId !== user.player_id) throw IdMismatchError;

    const [soulHome, error] = await this.soulHomeService.readOneById(
      stealToken.soulHomeId,
      { includeRefs: [ModelName.ROOM] },
    );
    if (error) return error;

    const [rooms, roomsError] = await this.roomService.readPlayerClanRooms(
      user.player_id,
      { includeRefs: [ModelName.ITEM] },
    );
    if (roomsError) return roomsError;

    soulHome.Room = rooms.filter((room) => room['Item'].length !== 0);

    return soulHome;
  }

  @Get('/:_id')
  @Authorize({ action: Action.read, subject: ItemDto })
  @UniformResponse(ModelName.ITEM)
  public get(@Param() param: _idDto) {
    return this.itemService.readOneById(param._id);
  }

  @Put()
  @Authorize({ action: Action.update, subject: ItemDto })
  @UniformResponse(ModelName.ITEM)
  public async updateOne(
    @Body() item: UpdateItemDto,
    @LoggedUser() user: User,
  ) {
    const [itemClan_id, errors] = await this.itemHelper.getItemClanId(item._id);

    if (errors || !itemClan_id) return [null, errors];

    const playerClan = await this.playerModel.findById(user.player_id);

    if (playerClan.clan_id.toString() !== itemClan_id)
      return [
        null,
        new APIError({
          reason: APIErrorReason.NOT_FOUND,
          field: '_id',
          value: item._id,
          message: 'Item with that _id not found',
        }),
      ];

    const [, updateErrors] = await this.itemService.updateOneById(item);
    if (updateErrors) return [null, updateErrors];
  }
}
