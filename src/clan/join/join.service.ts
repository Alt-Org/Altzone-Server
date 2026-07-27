import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { ClanService } from '../clan.service';
import { PlayerCounterFactory } from '../clan.counters';
import { CreateClanDto } from '../dto/createClan.dto';
import ICounter from '../../common/service/counter/ICounter';
import { Player } from '../../player/schemas/player.schema';
import { MemberClanRole } from '../role/initializationClanRoles';
import { ClanDto } from '../dto/clan.dto';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { ClanDocument } from '../clan.schema';
import { RoomService } from '../../clanInventory/room/room.service';
import { SoulHomeService } from '../../clanInventory/soulhome/soulhome.service';
import { RoomStatus } from '../../clanInventory/room/enum/roomStatus.enum';
import { endTransaction, initializeSession } from '../../common/function/Transactions';
import { cancelTransaction } from '../../common/function/cancelTransaction';
import ClanNotifier from '../clan.notifier';

@Injectable()
export class JoinService {
  private readonly logger = new Logger(JoinService.name);
  private readonly clanNotifier = new ClanNotifier();

  public constructor(
    private readonly playerCounterFactory: PlayerCounterFactory,
    private readonly clanService: ClanService,
    private readonly roomService: RoomService,
    private readonly soulHomeService: SoulHomeService,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.refsInModel = [];
    this.modelName = ModelName.JOIN;

    this.playerCounter = this.playerCounterFactory.create();
  }
  public readonly refsInModel: ModelName[];
  public readonly modelName: ModelName;
  private readonly playerCounter: ICounter;

  /**
   * Handle the request to join the Clan.
   *
   * In case the Clan is open the Player will be added immediately to the Clan.
   *
   * In case the Clan is closed, a request to join the Clan will be created.
   * @param clan_id Id of the clan to join.
   * @param player_id Id of the player trying to join.
   * @param password Password to a closed clan (optional)
   * @returns ClanDto with the clan data or throws NotFoundException if the clan is not found
   */
  public async handleJoinRequest(
    clan_id: string,
    player_id: string,
    password?: string,
  ): Promise<IServiceReturn<ClanDto>> {
    const [clan] = await this.clanService.readOneById(clan_id);
    if (!clan) throw new NotFoundException('Clan with that _id is not found');
    if (clan.playerCount >= 30)
      throw new ServiceError({
        reason: SEReason.MORE_THAN_MAX,
        message: 'This clan is full (max 30 players).',
      });

    const playerResp = await this.playerModel.findOne({ _id: player_id });

    if (!playerResp)
      throw new NotFoundException('Player with that _id is not found');

    if (
      playerResp.environment &&
      clan.environment &&
      playerResp.environment !== clan.environment
    ) {
      throw new ServiceError({
        reason: SEReason.ENVIRONMENT_MISMATCH,
        message: 'Player and clan must be in the same environment.',
      });
    }

    const player = {
      ...playerResp.toObject(),
      _id: playerResp._id.toString(),
      clan_id: playerResp.clan_id?.toString(),
    };

    if (!clan.isOpen && clan.password !== password) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (player.clan_id) {
      const [pclan] = await this.clanService.readOneById(player.clan_id);
      if (pclan.playerCount <= 1) {
        await this.clanService.deleteOneById(pclan._id);
      } else {
        await this.playerCounter.decreaseByIdOnOne(player.clan_id);
      }
    }

    await this.joinClan(player_id, clan_id);

    return [clan, null];
  }

  /**
   * Remove Player from Clan by the specified player_id
   * 
   * Deactivates Room
   * @param player_id to remove
   */
  public async leaveClan(player_id: string) {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    try {
      // get the player leaving
      const playerResp = await this.playerModel.findOne({ _id: player_id });
      if (!playerResp)
        throw new NotFoundException('Player with that _id is not found');

      const player = {
        ...playerResp.toObject(),
        _id: playerResp._id.toString(),
        clan_id: playerResp.clan_id?.toString(),
      };

      const clan_id = player.clan_id;
      if (!clan_id)
        throw new NotFoundException('Player is not joined to any clan');

      const [clan, clanErrors] = await this.clanService.readOneById(clan_id, { session });
      if (clanErrors) throw new NotFoundException('Clan with that _id not found');

      const [, deactivationErrors] = await this.roomService.deactivateRoom(clan._id, session);
      if (deactivationErrors) throw new NotFoundException('Room deactivation failed');

      if (clan.playerCount <= 1) {
        const [, clanDeleteErrors] = await this.clanService.deleteOneById(clan._id, session);
        if (clanDeleteErrors) throw new NotFoundException('Clan deletion failed');
      } else {
        const [, clanUpdateErrors] = await this.clanService.basicService.updateOne(
          { $inc: { playerCount: -1 } },
          {
            filter: { _id: clan._id },
            session
          }
        );
        if (clanUpdateErrors) throw new NotFoundException('Player count reduction failed');
      }

      await this.playerModel.updateOne(
        { _id: player_id },
        {
          clan_id: null,
        },
        { session }
      );

      await endTransaction(session);
      
      this.clanNotifier.memberLeave(clan_id, player_id);
    } catch (error) {
      await cancelTransaction(
        session, 
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            value: error,
          })
        ]
      );
      throw error;
    }
  }

  /**
   * Removes the specified Player from the Clan
   * 
   * Deactivates Room
   *
   * @param player_id
   * @param clan_id
   */
  public async removePlayerFromClan(
    player_id: string, 
    clan_id: string
  ) {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    try {
      // get the player to remove
      const playerResp = await this.playerModel.findOne({ _id: player_id });
      if (!playerResp)
        throw new NotFoundException('Player with that _id is not found');

      const [clan, clanErrors] = await this.clanService.readOneById(clan_id, { session });
      if (clanErrors) throw new NotFoundException('Clan with that _id not found');

      const [, deactivationErrors] = await this.roomService.deactivateRoom(clan._id, session);
      if (deactivationErrors) throw new NotFoundException('Room deactivation failed');

      //If the last player
      if (clan.playerCount <= 1) {
        const [, clanDeleteErrors] = await this.clanService.deleteOneById(clan._id, session);
        if (clanDeleteErrors) throw new NotFoundException('Clan deletion failed');
      } else {
        const [, clanUpdateErrors] = await this.clanService.basicService.updateOne(
          { $inc: { playerCount: -1 } },
          {
            filter: { _id: clan._id },
            session
          }
        );
        if (clanUpdateErrors) throw new NotFoundException('Player count reduction failed');
      }

      await this.playerModel.updateOne(
        { _id: player_id },
        {
          clan_id: null,
        },
        { session }
      ); // update clan_id for the requested player;

      await endTransaction(session);
      
      this.clanNotifier.memberLeave(clan_id, player_id);
    } catch (error) {
      await cancelTransaction(
        session, 
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            value: error,
          })
        ]
      );
      throw error;
    }
  }

  /**
   * Adds specified player to a clan.
   *
   * Notice that the player will be assigned a member role in the clan when he / she first joins the clan
   * 
   * Looks for a Room with roomStatus: "Inactive", then for Room with no status to convert to new Room,
   * lastly creates new Room
   * @param player_id _id of the player to be added
   * @param clan_id _id of the clan where the player should be added
   */
  private async joinClan(
    player_id: string, 
    clan_id: string
  ) {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    try {
      const [clan, clanReadingErrors] =
        await this.clanService.readOneById(clan_id, { session });
      if (clanReadingErrors) throw new NotFoundException('Clan with _id not found');
      
      const playerResp = await this.playerModel.findOne({ _id: player_id });

      if (
        playerResp.environment &&
        clan.environment &&
        playerResp.environment !== clan.environment
      ) {
        throw new ServiceError({
          reason: SEReason.ENVIRONMENT_MISMATCH,
          message: 'Player and clan must be in the same environment.',
        });
      }

      const memberRole = clan.roles.find(
        (role) => role.name === MemberClanRole.name,
      );
      if (!memberRole) throw new NotFoundException('Member role not found');

      await this.playerModel.updateOne(
        { _id: player_id },
        {
          clan_id,
          clanRole_id: memberRole._id,
        },
        { session }
      );

      const [, clanUpdateErrors] = await this.clanService.basicService.updateOne(
        { $inc: { playerCount: 1 } },
        {
          filter: { _id: clan._id },
          session
        }
      );
      if (clanUpdateErrors) throw new NotFoundException('Player count reduction failed');

      const [soulHome, soulHomeErrors] = await this.soulHomeService.basicService.readOne({
        filter: { clan_id: clan._id },
        session
      });
      if (soulHomeErrors) throw new NotFoundException('SoulHome with that _id not found');

      const [updatedRoom,] = await this.roomService.basicService.findOneAndUpdate(
        { 
          $set: { 
            deactivationTime: null,
            roomStatus: RoomStatus.ACTIVE 
          },
        },
        {
          filter: { 
            soulHome_id: soulHome._id, 
            roomStatus: RoomStatus.INACTIVE 
          },
          sort: { roomPosition: 1 },
          session
        },
      );
      
      if (!updatedRoom) {
        const [room,] = await this.roomService.basicService.readOne({ 
          filter: { soulHome_id: soulHome._id, roomPosition: null },
          session
        });

        if (room) {
          const position = await this.roomService.getRoomPosition(soulHome._id, session) + 1 || 1;
          const [, updatedRoomErrors] = await this.roomService.basicService.updateOneById(
            room._id,
            {
              $set: {
                roomPosition: position,
                roomColour: 'default',
                wallpaper: 'default',
                floor: 'default',
                roomStatus: RoomStatus.ACTIVE
              },
            },
            { session }
          );
          if (updatedRoomErrors) throw new Error('Failed to update old Room');
        } else {
          const [defaultRoom, defaultRoomErrors] = await this.roomService.getSoulHomeRoom(
            clan_id,
            session
          );
          if (defaultRoomErrors) throw new Error('Failed to get new Room for Player');

          const [, createdRoomErrors] = await this.roomService.basicService.createOne(
            defaultRoom, 
            { session }
          );
          if (createdRoomErrors) throw new Error('Failed to create new Room');
        }
      }
      
      await endTransaction(session);
      
      this.clanNotifier.memberJoin(clan_id, player_id);
    } catch (error) {
      await cancelTransaction(
        session, 
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            value: error,
          })
        ]
      );
      throw error;
    }
  }

  /**
   * Finds a joinable clan and assigns the player to it.
   * If clans exist, it picks one at random to ensure even distribution.
   * If no clans are available, it triggers an automatic clan creation.
   * @param playerId _id of the player
   */
  @OnEvent('player.created')
  async findClanForNewPlayer(playerId: string) {
    const playerResp = await this.playerModel.findById(playerId);

    if (!playerResp)
      throw new NotFoundException('Player with that _id is not found');

    const randomClan = await this.clanService.model
      .aggregate<ClanDocument>([
        {
          $match: {
            isOpen: true,
            playerCount: { $lt: 30 },
            environment: playerResp.environment,
          },
        },
        { $sample: { size: 1 } },
      ])
      .then((res) => res[0]);

    if (!randomClan) return this.createAndJoinExpeditionClan(playerId);

    await this.joinClan(playerId, String(randomClan._id));
  }

  /**
   * Creates a new clan with a unique name with the tag "AUTO" and a default phrase,
   * then makes the player join into it.
   * @param playerId _id of the player
   */
  private async createAndJoinExpeditionClan(playerId: string) {
    const totalClans = await this.clanService.model.countDocuments();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const newClanName = `Expedition ${totalClans + 1}-${randomSuffix}`;

    const playerResp = await this.playerModel.findById(playerId);

    if (!playerResp)
      throw new NotFoundException('Player with that _id is not found');

    const createClanDto: CreateClanDto = {
      name: newClanName,
      tag: 'AUTO',
      phrase: 'A new expedition begins!',
      isOpen: true,
      labels: [],
      environment: playerResp.environment,
    };

    const [newClan, errors] =
      await this.clanService.createOneWithoutAdmin(createClanDto);

    if (errors || !newClan) {
      return;
    }

    return await this.joinClan(playerId, String(newClan._id));
  }
}
