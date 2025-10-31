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
import ICounter from '../../common/service/counter/ICounter';
import { Player } from '../../player/schemas/player.schema';
import { MemberClanRole } from '../role/initializationClanRoles';
import { ClanDto } from '../dto/clan.dto';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { cancelTransaction, endTransaction, InitializeSession }
 from '../../common/function/Transactions';

@Injectable()
export class JoinService {
  public constructor(
    private readonly playerCounterFactory: PlayerCounterFactory,
    private readonly clanService: ClanService,
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

    const player = {
      ...playerResp.toObject(),
      _id: playerResp._id.toString(),
      clan_id: playerResp.clan_id?.toString(),
    };

    if (!clan.isOpen && clan.password !== password) {
      throw new UnauthorizedException('Incorrect password');
    }

    const session = await InitializeSession(this.connection);
    try {
    if (player.clan_id) {
      const [pclan] = await this.clanService.readOneById(player.clan_id);
      if (pclan.playerCount <= 1) {
        await this.clanService.deleteOneById(pclan._id);
      } else {
        await this.playerCounter.decreaseByIdOnOne(player.clan_id);
      }
    }
    
    await this.joinClan(player_id, clan_id);

    } catch (error) {
      await cancelTransaction(session, error as ServiceError[]);
      throw error;
    }

    return await endTransaction(session, clan);
  }

  /**
   * Remove Player from Clan by the specified player_id
   * @param player_id to remove
   */
  public async leaveClan(player_id: string) {
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

    const [clan] = await this.clanService.readOneById(clan_id);
    if (!clan) throw new NotFoundException('Clan with that _id not found');

    const session = await InitializeSession(this.connection);
    try {
      
    if (clan.playerCount <= 1) {
      await this.clanService.deleteOneById(clan._id);
    } else {
      await this.playerCounter.decreaseByIdOnOne(clan_id);
    }
    await this.playerModel.updateOne(
      { _id: player_id },
      {
        clan_id: null,
      },
    );
    } catch (error) {
      await cancelTransaction(session, error as ServiceError[]);
      throw error;
    }

    await endTransaction(session);
  }

  /**
   * Removes the specified Player from the Clan
   *
   * @param player_id
   * @param clan_id
   */
  public async removePlayerFromClan(player_id: string, clan_id: string) {
    // get the player to remove
    const playerResp = await this.playerModel.findOne({ _id: player_id });

    if (!playerResp)
      throw new NotFoundException('Player with that _id is not found');

    const [clan] = await this.clanService.readOneById(clan_id);

    if (!clan) throw new NotFoundException('Clan with that _id not found');

    const session = await InitializeSession(this.connection);
    try {
    //If the last player
    if (clan.playerCount <= 1) {
      await this.clanService.deleteOneById(clan._id);
    } else {
      await this.playerCounter.decreaseByIdOnOne(clan_id);
    }
    await this.playerModel.updateOne(
      { _id: player_id },
      {
        clan_id: null,
      },
    ); // update clan_id for the requested player;
    } catch (error) {
      await cancelTransaction(session, error as ServiceError[]);
      throw error;
    }

    await endTransaction(session);
  }

  /**
   * Adds specified player to a clan.
   *
   * Notice that the player will be assigned a member role in the clan when he / she first joins the clan
   * @param player_id _id of the player to be added
   * @param clan_id _id of the clan where the player should be added
   */
  private async joinClan(player_id: string, clan_id: string) {
    const [clan, _clanReadingErrors] =
      await this.clanService.readOneById(clan_id);
    const memberRole = clan.roles.find(
      (role) => role.name === MemberClanRole.name,
    );

    await this.playerModel.updateOne(
      { _id: player_id },
      {
        clan_id,
        clanRole_id: memberRole._id,
      },
    );
    await this.playerCounter.increaseByIdOnOne(clan_id);
  }
}
