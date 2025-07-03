import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Box } from '../schemas/box.schema';
import { Model } from 'mongoose';
import { GroupAdmin } from '../groupAdmin/groupAdmin.schema';
import { Profile } from '../../profile/profile.schema';
import { Player } from '../../player/schemas/player.schema';
import { Clan } from '../../clan/clan.schema';
import { SoulHome } from '../../clanInventory/soulhome/soulhome.schema';
import { Room } from '../../clanInventory/room/room.schema';
import { Stock } from '../../clanInventory/stock/stock.schema';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { IServiceReturn } from '../../common/service/basicService/IService';
import BasicService from '../../common/service/basicService/BasicService';

@Injectable()
export class BoxHelper {
  public constructor(
    @InjectModel(Box.name) public readonly model: Model<Box>,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
    @InjectModel(Profile.name) public readonly profileModel: Model<Profile>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(SoulHome.name) public readonly soulHomeModel: Model<SoulHome>,
    @InjectModel(Room.name) public readonly roomModel: Model<Room>,
    @InjectModel(Stock.name) public readonly stockModel: Model<Stock>,
  ) {
    this.basicService = new BasicService(model);
  }
  private readonly basicService: BasicService;

  /**
   * Validates that all the data provided for the box can be found from DB
   *
   * @param box
   *
   * @returns true if everything is valid or NOT_FOUND ServiceError if some of the data can not be found
   */
  public async validateBox(box: Box): Promise<IServiceReturn<true>> {
    if (!box)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'box',
            value: box,
            message: 'box parameter is required',
          }),
        ],
      ];

    if (!box.adminPassword)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'adminPassword',
            value: box.adminPassword,
            message: 'adminPassword is required',
          }),
        ],
      ];

    const adminPasswordInDB = await this.groupAdminModel.findOne({
      password: box.adminPassword,
    });
    if (!adminPasswordInDB)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'adminPassword',
            value: box.adminPassword,
            message: 'Admin password is not found',
          }),
        ],
      ];

    const adminProfile = await this.profileModel.findById(box.adminProfile_id);
    if (!adminProfile)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'adminProfile_id',
            value: box.adminProfile_id,
            message: 'Admin profile _id is not found',
          }),
        ],
      ];

    const adminPlayer = await this.playerModel.findById(box.adminPlayer_id);
    if (!adminPlayer)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'adminPlayer_id',
            value: box.adminPlayer_id,
            message: 'Admin player _id is not found',
          }),
        ],
      ];

    const clansInDB = await this.clanModel.find({ _id: { $in: box.clan_ids } });
    if (clansInDB.length !== box.clan_ids.length)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'clan_ids',
            value: box.clan_ids,
            message: 'Some of the clans are not found',
          }),
        ],
      ];

    const stocksInDB = await this.stockModel.find({
      _id: { $in: box.stock_ids },
    });
    if (stocksInDB.length !== box.stock_ids.length)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'stock_ids',
            value: box.stock_ids,
            message: 'Some of the stock_ids are not found',
          }),
        ],
      ];

    const soulHomesInDB = await this.soulHomeModel.find({
      _id: { $in: box.soulHome_ids },
    });
    if (soulHomesInDB.length !== box.soulHome_ids.length)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'soulHome_ids',
            value: box.soulHome_ids,
            message: 'Some of the soulHome_ids are not found',
          }),
        ],
      ];

    const roomsInDB = await this.roomModel.find({ _id: { $in: box.room_ids } });
    if (roomsInDB.length !== box.room_ids.length)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'room_ids',
            value: box.room_ids,
            message: 'Some of the room_ids are not found',
          }),
        ],
      ];

    return [true, null];
  }

  /**
   * Checks whenever a box for specified group admin is already created.
   * @param groupAdminPassword group admin password
   *
   * @return true if the box is registered or false if not
   */
  public async isBoxRegistered(groupAdminPassword: string): Promise<boolean> {
    const [box] = await this.basicService.readOne<Box>({
      filter: { adminPassword: groupAdminPassword },
    });

    return box ? true : false;
  }
}
