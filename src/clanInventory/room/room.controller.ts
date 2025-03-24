import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomDto } from './dto/room.dto';
import { UpdateRoomDto } from './dto/updateRoom.dto';
import { ActivateRoomDto } from './dto/ActivateRoom.dto';
import RoomHelperService from './utils/room.helper.service';
import { publicReferences } from './room.schema';
import { User } from '../../auth/user';
import { Authorize } from '../../authorization/decorator/Authorize';
import { Action } from '../../authorization/enum/action.enum';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { GetAllQuery } from '../../common/decorator/param/GetAllQuery';
import { IncludeQuery } from '../../common/decorator/param/IncludeQuery.decorator';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { _idDto } from '../../common/dto/_id.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import { AddSearchQuery } from '../../common/interceptor/request/addSearchQuery.interceptor';
import { AddSortQuery } from '../../common/interceptor/request/addSortQuery.interceptor';
import { OffsetPaginate } from '../../common/interceptor/request/offsetPagination.interceptor';
import { IGetAllQuery } from '../../common/interface/IGetAllQuery';

@Controller('room')
export class RoomController {
  public constructor(
    private readonly service: RoomService,
    private readonly roomHelperService: RoomHelperService,
  ) {}

  @Get('/:_id')
  @Authorize({ action: Action.read, subject: RoomDto })
  @UniformResponse(ModelName.ROOM)
  public async get(
    @Param() param: _idDto,
    @LoggedUser() user: User,
    @IncludeQuery(publicReferences) includeRefs: ModelName[],
  ) {
    return this.service.readOneByIdAndPlayerId(param._id, user.player_id, {
      filter: undefined,
      includeRefs,
    });
  }

  @Get()
  @Authorize({ action: Action.read, subject: RoomDto })
  @OffsetPaginate(ModelName.ROOM)
  @AddSearchQuery(RoomDto)
  @AddSortQuery(RoomDto)
  @UniformResponse(ModelName.ROOM)
  public async getAll(
    @GetAllQuery() query: IGetAllQuery,
    @LoggedUser() user: User,
  ) {
    return this.service.readPlayerClanRooms(user.player_id, query);
  }

  @Put()
  @Authorize({ action: Action.update, subject: UpdateRoomDto })
  @UniformResponse()
  public async update(@Body() body: UpdateRoomDto) {
    const [, errors] = await this.service.updateOneById(body);
    if (errors) return [null, errors];
  }

  @Post('/activate')
  @UniformResponse(ModelName.ROOM)
  public async activate(
    @Body() body: ActivateRoomDto,
    @LoggedUser() user: User,
  ) {
    const { room_ids, durationS } = body;

    const [rooms, errors] = await this.roomHelperService.getPlayerRooms(
      user.player_id,
    );
    if (errors || !rooms) return [null, errors];

    const userRoomIds = rooms.map((room) => room?._id?.toString());
    const allowedRooms = room_ids.filter((_id) => userRoomIds.includes(_id));

    if (allowedRooms.length === 0)
      return [
        null,
        [
          new APIError({
            reason: APIErrorReason.NOT_FOUND,
            message: 'Could not find any of the specified rooms',
            field: 'room_ids',
            value: room_ids,
          }),
        ],
      ];

    this.service.activateRoomsByIds(allowedRooms, durationS ?? 21600); //6h is default
  }
}
