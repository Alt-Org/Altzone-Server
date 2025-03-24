import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoulHomeDto } from '../../soulhome/dto/soulhome.dto';
import { SoulHome } from '../../soulhome/soulhome.schema';
import { RoomDto } from '../dto/room.dto';
import { Clan } from '../../../clan/clan.schema';
import { ClanDto } from '../../../clan/dto/clan.dto';
import { ModelName } from '../../../common/enum/modelName.enum';
import BasicService from '../../../common/service/basicService/BasicService';
import { SEReason } from '../../../common/service/basicService/SEReason';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { PlayerDto } from '../../../player/dto/player.dto';
import { Player } from '../../../player/player.schema';

/**
 * Class containing helper methods used in the module service(s)
 */
@Injectable()
export default class RoomHelperService {
  public constructor(
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(SoulHome.name) public readonly soulHomeModel: Model<SoulHome>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
  ) {
    this.clanBasicService = new BasicService(clanModel);
    this.soulHomeBasicService = new BasicService(soulHomeModel);
    this.playerBasicService = new BasicService(playerModel);
  }

  private readonly clanBasicService: BasicService;
  private readonly soulHomeBasicService: BasicService;
  private readonly playerBasicService: BasicService;

  /**
   * Get the SoulHome of the Clan to which Player belongs to
   *
   * @param player_id Mongo _id of the Player
   * @returns _SoulHome_ object if the Player belongs to Clan or
   * array with _ServiceError_ with reason NOT_FOUND if the Player can not be found,
   * the Player does not belong to any Clan or if this Clan does not have any SoulHome
   */
  async getPlayerSoulHome(
    player_id: string,
  ): Promise<[SoulHomeDto | null, ServiceError[] | null]> {
    const [player, playerErrors] =
      await this.playerBasicService.readOneById<PlayerDto>(player_id);

    if (playerErrors || !player)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'player_id',
            value: player_id,
            message: 'Could not find any Player with this _id',
          }),
        ],
      ];

    const { clan_id } = player;
    if (!clan_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'clan_id',
            value: clan_id,
            message: 'The Player is not in any Clan',
          }),
        ],
      ];

    const [clan, errors] = await this.clanBasicService.readOneById<ClanDto>(
      clan_id,
      { includeRefs: [ModelName.SOULHOME] },
    );
    if (errors || !clan)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'clan_id',
            value: clan_id,
            message: 'Could not find any Clan with this _id',
          }),
        ],
      ];

    const clanSoulHome = clan.SoulHome as SoulHomeDto;

    if (!clanSoulHome)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'soulHome_id',
            value: undefined,
            message: 'Could not find SoulHome of the Clan',
          }),
        ],
      ];

    return [clanSoulHome, null];
  }

  /**
   * Get array of Room objects of the Clan to which Player belongs to
   *
   * @param player_id Mongo _id of the Player
   * @returns _Rooms array_ object if the Player belongs to Clan or
   * array with _ServiceError_ with reason NOT_FOUND if the Player can not be found,
   * the Player does not belong to any Clan or if this Clan does not have any SoulHome
   */
  async getPlayerRooms(
    player_id: string,
  ): Promise<[RoomDto[] | null, ServiceError[] | null]> {
    const [soulHome, errors] = await this.getPlayerSoulHome(player_id);

    if (errors || !soulHome) return [null, errors];

    const [soulHomeWithRooms, roomsErrors] =
      await this.soulHomeBasicService.readOneById<SoulHomeDto>(soulHome._id, {
        includeRefs: [ModelName.ROOM],
      });

    if (roomsErrors || !soulHomeWithRooms) return [null, roomsErrors];

    const rooms = soulHomeWithRooms.Room;
    if (!rooms) return [[], null];

    return [rooms, null];
  }
}
