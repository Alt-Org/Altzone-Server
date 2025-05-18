import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BasicServiceDummyAbstract } from '../../common/base/abstract/basicServiceDummy.abstract';
import { AddBasicService } from '../../common/base/decorator/AddBasicService.decorator';
import { IBasicService } from '../../common/base/interface/IBasicService';
import {
  IHookImplementer,
  PostHookFunction,
} from '../../common/interface/IHookImplementer';
import { Join } from './join.schema';
import { Model, Types } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { IgnoreReferencesType } from '../../common/type/ignoreReferences.type';
import { JoinRequestDto } from './dto/joinRequest.dto';
import { JoinResultDto } from './dto/joinResult.dto';
import { IResponseShape } from '../../common/interface/IResponseShape';
import { ClanService } from '../clan.service';
import { PlayerCounterFactory } from '../clan.counters';
import ICounter from '../../common/service/counter/ICounter';
import { Player } from '../../player/schemas/player.schema';
import { MemberClanRole } from '../role/initializationClanRoles';

@Injectable()
@AddBasicService()
export class JoinService
  extends BasicServiceDummyAbstract<Join>
  implements IBasicService<Join>, IHookImplementer
{
  public constructor(
    @InjectModel(Join.name) public readonly model: Model<Join>,
    private readonly playerCounterFactory: PlayerCounterFactory,
    private readonly clanService: ClanService,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
  ) {
    super();
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
   * @param joinRequest request to join the Clan
   * @returns
   */
  public async handleJoinRequest(joinRequest: JoinRequestDto) {
    const { player_id, clan_id } = joinRequest;

    const [clan] = await this.clanService.readOneById(clan_id);
    if (!clan) throw new NotFoundException('Clan with that _id is not found');

    const playerResp = await this.playerModel.findOne({ _id: player_id });

    if (!playerResp)
      throw new NotFoundException('Player with that _id is not found');

    const player = {
      ...playerResp.toObject(),
      _id: playerResp._id.toString(),
      clan_id: playerResp.clan_id?.toString(),
    };

    // check if clan to join is open
    if (clan.isOpen) {
      // does the player in some old clan? if so reduce the players in the old clan
      if (player.clan_id) {
        const [pclan] = await this.clanService.readOneById(player.clan_id);
        if (pclan.playerCount <= 1) {
          await this.clanService.deleteOneById(pclan._id);
        } else {
          await this.playerCounter.decreaseByIdOnOne(player.clan_id);
        }
      }
      await this.joinClan(player_id, clan_id); // join the clan
      const resp = this.configureResponse(joinRequest); //this.createOne(body);

      return resp;
    }

    if (!joinRequest.join_message)
      throw new BadRequestException(
        'The join_message must be specified for the closed clans',
      );

    // if clan closed and join_meaasage provided create a joinrequest in db
    return this.createOne(joinRequest);
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
    );
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
  }

  public updateOnePostHook: PostHookFunction = async (
    input: Partial<JoinResultDto>,
    oldDoc: Join,
  ): Promise<boolean> => {
    if (!input?.accepted) {
      return true;
    }

    const playerResp = await this.playerModel.findOne({
      _id: oldDoc.player_id,
    });
    let player = null;
    if (playerResp) {
      player = {
        ...playerResp.toObject(),
        clan_id: playerResp.clan_id?.toString(),
      };
    }

    if (input.accepted) {
      // if player was accepted join the clan
      if (player?.clan_id) {
        //await this.playerCounter.increaseByIdOnOne(player.clan_id);
        //await this.requestHelperService.changeCounterValue(ModelName.CLAN, { _id: player.clan_id }, "playerCount", -1)
      }
      this.joinClan(oldDoc.player_id, oldDoc.clan_id);
    }
    this.deleteOneById(input._id); // delete the join request
    return true;
  };

  public clearCollectionReferences = async (
    _id: Types.ObjectId,
    _ignoreReferences?: IgnoreReferencesType,
  ): Promise<void> => {};

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

  private configureResponse = (data: any): IResponseShape => {
    const dataKey = this.modelName;
    const dataType = Array.isArray(data) ? 'Array' : 'Object';
    const dataCount = dataType === 'Array' ? data.length : 1;
    return {
      data: {
        [dataKey]: data,
      },
      metaData: {
        dataKey: dataKey,
        modelName: this.modelName,
        dataType,
        dataCount,
      },
    };
  };
}
