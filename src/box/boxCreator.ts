import { Injectable } from '@nestjs/common';
import { CreateBoxDto } from './dto/createBox.dto';
import { IServiceReturn } from '../common/service/basicService/IService';
import { InjectModel } from '@nestjs/mongoose';
import { Box, BoxDocument } from './schemas/box.schema';
import { Model, MongooseError } from 'mongoose';
import { Player } from '../player/schemas/player.schema';
import { Clan } from '../clan/clan.schema';
import { Room } from '../clanInventory/room/room.schema';
import { GroupAdmin } from './groupAdmin/groupAdmin.schema';
import { BoxHelper } from './util/boxHelper';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { ObjectId } from 'mongodb';
import { ClanService } from '../clan/clan.service';
import { ChatService } from '../chat/chat.service';
import { ProfileService } from '../profile/profile.service';
import { PlayerService } from '../player/player.service';
import { convertMongooseToServiceErrors } from '../common/service/basicService/BasicService';
import { ClanLabel } from '../clan/enum/clanLabel.enum';
import { ClanDto } from '../clan/dto/clan.dto';
import { Chat } from '../chat/chat.schema';
import generateClanNames from './util/generateClanNames';
import { BoxService } from './box.service';
import { CreatedBox } from './payloads/CreatedBox';
import { ProfileDto } from '../profile/dto/profile.dto';

@Injectable()
export default class BoxCreator {
  constructor(
    @InjectModel(Box.name) public readonly model: Model<Box>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(Room.name) public readonly roomModel: Model<Room>,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
    private readonly boxHelper: BoxHelper,
    private readonly clanService: ClanService,
    private readonly chatService: ChatService,
    private readonly profilesService: ProfileService,
    private readonly playerService: PlayerService,
    private readonly boxService: BoxService,
  ) {}

  /**
   * Initialize a box for testing session by creating a box, box admin profile and player,
   * chat, as well as 2 clans with soul homes, rooms, stocks and items.
   * Notice that if clan names are not provided they will be autogenerated: player name + clan + 1/2, i.e. "John clan 1"
   * Notice that if any errors occur on any of the initialization stage, all data of the box will be removed.
   * @param boxToInit box to create
   *
   * @returns created box and all corresponding data to it on success or ServiceErrors:
   *
   * - NOT_UNIQUE if the provided adminPassword, player name or clan names already exist
   * - NOT_FOUND if the provided admin password does not exist
   * - REQUIRED if the provided input is null or undefined
   */
  public async createBox(
    boxToInit: CreateBoxDto,
  ): Promise<IServiceReturn<CreatedBox>> {
    if (!boxToInit)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'boxToInit',
            value: boxToInit,
            message: 'boxToInit parameter is required',
          }),
        ],
      ];

    const [, boxValidationErrors] = await this.validateBox(boxToInit);

    if (boxValidationErrors) return [null, boxValidationErrors];

    const boxToCreate: Partial<Box> = {};
    boxToCreate.adminPassword = boxToInit.adminPassword;

    const [adminProfile, adminProfileErrors] = await this.createAdminProfile(
      boxToInit.adminPassword,
    );
    if (adminProfileErrors) {
      await this.boxService.deleteBoxReferences(boxToCreate);
      return [null, adminProfileErrors];
    }
    boxToCreate.adminProfile_id = adminProfile._id as unknown as ObjectId;

    const [adminPlayer, adminPlayerErrors] = await this.createAdminPlayer({
      name: boxToInit.playerName,
      backpackCapacity: 0,
      uniqueIdentifier: boxToInit.playerName,
      above13: true,
      parentalAuth: true,
      profile_id: adminProfile._id,
    });
    if (adminPlayerErrors) {
      await this.boxService.deleteBoxReferences(boxToCreate);
      return [null, adminPlayerErrors];
    }
    boxToCreate.adminPlayer_id = adminPlayer._id as unknown as ObjectId;

    let clanName1: string, clanName2: string;
    if (boxToInit.clanNames) {
      clanName1 = boxToInit.clanNames[0];
      clanName2 = boxToInit.clanNames[1];
    } else {
      const generatedNames = generateClanNames(boxToInit.playerName, 2);
      clanName1 = generatedNames[0];
      clanName2 = generatedNames[1];
    }

    const [clans, clanErrors] = await this.createBoxClans(
      clanName1,
      clanName2,
      boxToCreate.adminPlayer_id,
    );
    if (clanErrors) {
      await this.boxService.deleteBoxReferences(boxToCreate);
      return [null, clanErrors];
    }
    const [clan1, clan2] = clans;

    boxToCreate.clan_ids = [new ObjectId(clan1._id), new ObjectId(clan2._id)];
    boxToCreate.soulHome_ids = [
      new ObjectId(clan1.SoulHome._id),
      new ObjectId(clan2.SoulHome._id),
    ];
    boxToCreate.stock_ids = [
      new ObjectId(clan1.Stock._id),
      new ObjectId(clan2.Stock._id),
    ];

    const soulHome1Rooms = await this.roomModel
      .find({ soulHome_id: clan1.SoulHome._id })
      .select(['_id']);
    const soulHome1Rooms_ids = soulHome1Rooms.map(
      (room) => room._id,
    ) as unknown as ObjectId[];
    const soulHome2Rooms = await this.roomModel
      .find({ soulHome_id: clan2.SoulHome._id })
      .select(['_id']);
    const soulHome2Rooms_ids = soulHome2Rooms.map(
      (room) => room._id,
    ) as unknown as ObjectId[];
    boxToCreate.room_ids = [...soulHome1Rooms_ids, ...soulHome2Rooms_ids];

    const [chat, chatErrors] = await this.createBoxChat();
    if (chatErrors) {
      await this.boxService.deleteBoxReferences(boxToCreate);
      return [null, chatErrors];
    }
    boxToCreate.chat_id = chat._id;

    const weekMs = 1000 * 60 * 60 * 24 * 7;
    boxToCreate.sessionResetTime = new Date().getTime() + weekMs;
    const monthMs = 1000 * 60 * 60 * 24 * 30;
    boxToCreate.boxRemovalTime = new Date().getTime() + monthMs;

    const [createdBox, errors] = await this.boxService.createOne(
      boxToCreate as BoxDocument,
    );

    if (errors) return [null, errors];

    const {
      Stock: _stock1,
      SoulHome: _soulHome1,
      ...createdClan1
    } = (clan1 as any).toObject();
    const {
      Stock: _stock2,
      SoulHome: _soulHome2,
      ...createdClan2
    } = (clan2 as any).toObject();
    const {
      __v,
      id: _id,
      ...createdAdminPlayer
    } = (adminPlayer as any).toObject();
    const {
      __v: _chat_v,
      id: _chat_id,
      ...createdChat
    } = (chat as any).toObject();

    return [
      {
        ...createdBox.toObject(),
        adminPlayer: createdAdminPlayer,
        clans: [createdClan1, createdClan2],
        chat: createdChat,
      },
      null,
    ];
  }

  /**
   * Validates provided box data
   * @param boxToValidate box data to validate
   *
   * @returns true if data is valid or ServiceErrors if found:
   *
   * - NOT_UNIQUE if the provided adminPassword, player name or clan names already exist
   * - NOT_FOUND if the provided admin password does not exist
   */
  private async validateBox(
    boxToValidate: CreateBoxDto,
  ): Promise<IServiceReturn<true>> {
    const groupAdmin = await this.groupAdminModel.findOne({
      password: boxToValidate.adminPassword,
    });
    if (!groupAdmin)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'adminPassword',
            message: 'Provided admin password is not found',
          }),
        ],
      ];

    const boxAlreadyCreated = await this.boxHelper.isBoxRegistered(
      boxToValidate.adminPassword,
    );
    if (boxAlreadyCreated)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'adminPassword',
            message: 'Box for provided password is already created',
          }),
        ],
      ];

    const isAdminPlayerNameTaken = await this.playerModel.findOne({
      name: boxToValidate.playerName,
    });
    if (isAdminPlayerNameTaken)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'playerName',
            value: boxToValidate.playerName,
            message: 'Provided player name is already taken',
          }),
        ],
      ];

    if (boxToValidate.clanNames) {
      const clanWithNames = await this.clanModel.find({
        name: { $in: boxToValidate.clanNames },
      });
      const clanUniquenessErrors = clanWithNames.map((existingClan) => {
        return new ServiceError({
          reason: SEReason.NOT_UNIQUE,
          field: 'clanNames',
          value: existingClan.name,
          message: 'Provided clan name is already taken',
        });
      });

      if (clanUniquenessErrors.length > 0) return [null, clanUniquenessErrors];
    }

    return [true, null];
  }

  /**
   * Creates a profile for group admin, where username and password are the same
   * @param adminPassword admin password to set
   * @returns created admin profile or ServiceErrors if any occurred
   */
  private async createAdminProfile(
    adminPassword: string,
  ): Promise<IServiceReturn<ProfileDto>> {
    return this.profilesService.createWithHashedPassword({
      username: adminPassword,
      password: adminPassword,
    });
  }

  /**
   * Creates a player for group admin
   * @param playerToCreate admin player to create
   * @returns created admin player or ServiceErrors if any occurred
   */
  private async createAdminPlayer(
    playerToCreate: Partial<Player>,
  ): Promise<IServiceReturn<Player>> {
    const adminPlayer = await this.playerService.createOne(playerToCreate);
    if (adminPlayer instanceof MongooseError) {
      const creationErrors = convertMongooseToServiceErrors(adminPlayer);
      return [null, creationErrors];
    }

    return [adminPlayer.data[adminPlayer.metaData.dataKey], null];
  }

  /**
   * Creates 2 clans for the box.
   *
   * Notice that names of the clans should be unique.
   *
   * @param clanName1 name of the first clan
   * @param clanName2 name of the second clan
   * @param adminPlayer_id admin player _id to set as a clan admin
   *
   * @returns created clans or ServiceErrors if any occurred
   */
  private async createBoxClans(
    clanName1,
    clanName2,
    adminPlayer_id: ObjectId,
  ): Promise<IServiceReturn<ClanDto[]>> {
    const defaultClanData = {
      tag: '',
      labels: [ClanLabel.GAMERIT],
      phrase: 'Not-set',
    };

    const [clan1Resp, clan1Errors] = await this.clanService.createOne(
      {
        name: clanName1,
        ...defaultClanData,
      },
      adminPlayer_id.toString(),
    );

    if (clan1Errors) return [null, clan1Errors];

    const [clan2Resp, clan2Errors] = await this.clanService.createOne(
      {
        name: clanName2,
        ...defaultClanData,
      },
      adminPlayer_id.toString(),
    );

    if (clan2Errors) return [null, clan2Errors];

    return [[clan1Resp, clan2Resp], null];
  }

  /**
   * Creates a chat for a box, which contains no messages
   * @returns created chat or ServiceErrors if any occurred
   */
  private async createBoxChat(): Promise<IServiceReturn<Chat>> {
    const chatResp = await this.chatService.createOne({ messages: [] });
    if (chatResp instanceof MongooseError) {
      const creationErrors = convertMongooseToServiceErrors(chatResp);
      return [null, creationErrors];
    }

    return [chatResp.data[chatResp.metaData.dataKey], null];
  }
}
