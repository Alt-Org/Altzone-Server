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
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';

@Controller('room')
export class RoomController {
  public constructor(
    private readonly service: RoomService,
    private readonly roomHelperService: RoomHelperService,
  ) {}

  /**
   * Get Room by _id.
   *
   * @remarks Get Room by its _id.
   *
   * If the logged-in user is a Clan member and the Clan does have the requested Room, the Room for this Clan will be returned.
   *
   * If the logged-in user is not belonging to any Clan, or Room in that Clan with provided _id is not found the 404 error will be returned.
   */
  @ApiResponseDescription({
    success: {
      dto: RoomDto,
      modelName: ModelName.ROOM,
    },
    errors: [400, 401, 404],
  })
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

  /**
   * Get Room all Clan's rooms
   *
   * @remarks Get all Rooms for the logged-in user.
   *
   * If the logged-in user is a Clan member, the Rooms for this Clan will be returned.
   *
   * If the logged-in user is not belonging to any Clan the 404 error will be returned.
   *
   * If the pagination is required, it can be used, but by default it will return all 30 rooms at once.
   */
  @ApiResponseDescription({
    success: {
      dto: RoomDto,
      modelName: ModelName.ROOM,
      returnsArray: true,
    },
    errors: [401, 404],
  })
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

  /**
   * Update room by _id
   *
   * @remarks Update Room by its _id specified in the body.
   *
   * Any Clan member can update any Room, which (SoulHome) belongs to the Clan.
   *
   * If the logged-in user is a Clan member and the Clan does have the requested Room, the Room for this Clan will be returned.
   *
   * If the logged-in user is not belonging to any Clan, or Room in that Clan with provided _id is not found the 404 error will be returned.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404],
  })
  @Put()
  @Authorize({ action: Action.update, subject: UpdateRoomDto })
  @UniformResponse()
  public async update(@Body() body: UpdateRoomDto) {
    const [, errors] = await this.service.updateOneById(body);
    if (errors) return [null, errors];
  }

  /**
   * Activate room by _id
   *
   * @remarks Activate the specified Rooms.
   *
   * If Room _id specified in the room_ids field does not belong to logged-in user's Clan (SoulHome), it will be ignored.
   * However, it will return 404 if none of the Room _ids does not belong to the Clan.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404],
  })
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
