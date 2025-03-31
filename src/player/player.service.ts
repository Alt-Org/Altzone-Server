import { BadRequestException, Injectable } from '@nestjs/common';
import { Model, Types, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Player, publicReferences } from './schemas/player.schema';
import { RequestHelperService } from '../requestHelper/requestHelper.service';
import { IBasicService } from '../common/base/interface/IBasicService';
import { IgnoreReferencesType } from '../common/type/ignoreReferences.type';
import { ModelName } from '../common/enum/modelName.enum';
import { CustomCharacterService } from './customCharacter/customCharacter.service';
import { BasicServiceDummyAbstract } from '../common/base/abstract/basicServiceDummy.abstract';
import { AddBasicService } from '../common/base/decorator/AddBasicService.decorator';
import { ClanDto } from '../clan/dto/clan.dto';
import {
  IHookImplementer,
  PostHookFunction,
} from '../common/interface/IHookImplementer';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { PlayerDto } from './dto/player.dto';
import BasicService from '../common/service/basicService/BasicService';
import {
  TIServiceReadManyOptions,
  TReadByIdOptions,
} from '../common/service/basicService/IService';

@Injectable()
@AddBasicService()
export class PlayerService
  extends BasicServiceDummyAbstract
  implements IBasicService, IHookImplementer
{
  public constructor(
    @InjectModel(Player.name) public readonly model: Model<Player>,
    private readonly customCharacterService: CustomCharacterService,
    private readonly requestHelperService: RequestHelperService,
  ) {
    super();
    this.basicService = new BasicService(model);
    this.refsInModel = publicReferences;
    this.modelName = ModelName.PLAYER;
  }

  public readonly refsInModel: ModelName[];
  public readonly modelName: ModelName;
  private readonly basicService: BasicService;

  /**
   * Retrieves a player by their unique identifier.
   *
   * @param _id - The unique identifier of the player.
   * @param options - Optional settings for retrieving the player.
   * @returns An PlayerDTO if succeeded or an array of ServiceErrors.
   */
  async getPlayerById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options;
    if (options?.includeRefs) {
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );
    }
    return this.basicService.readOneById<PlayerDto>(_id, optionsToApply);
  }

  /**
   * This method is used in the LeaderboardService and serves as a replacement
   * for the deprecated readAll method from the BasicServiceDummyAbstract.
   * It should be renamed to readAll when the service is updated to the new way.
   *
   * @param options - Options for reading players.
   * @returns - An array of players if succeeded or an array of ServiceErrors if error occurred.
   */
  async getAll(options?: TIServiceReadManyOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );

    return this.basicService.readMany<PlayerDto>(optionsToApply);
  }

  public clearCollectionReferences = async (
    _id: Types.ObjectId,
    _ignoreReferences?: IgnoreReferencesType,
  ): Promise<void> => {
    const isClanRefCleanSuccess = await this.clearClanReferences(
      _id.toString(),
    );
    if (isClanRefCleanSuccess instanceof Error)
      throw new BadRequestException(isClanRefCleanSuccess.message);
    await this.customCharacterService.deleteMany({ player_id: _id });
  };

  public updateOnePostHook: PostHookFunction = async (
    input: Partial<UpdatePlayerDto>,
    oldDoc: Partial<Player>,
    _output: Partial<Player>,
  ): Promise<boolean> => {
    if (!input?.clan_id) return true;

    const changeCounterValue = this.requestHelperService.changeCounterValue;

    //decrease playerCounter from old clan
    const clanRemoveFrom_id = oldDoc.clan_id;
    if (clanRemoveFrom_id)
      await changeCounterValue(
        ModelName.CLAN,
        { _id: clanRemoveFrom_id },
        'playerCount',
        -1,
      );

    const isPlayerCountIncreased = await changeCounterValue(
      ModelName.CLAN,
      { _id: input.clan_id },
      'playerCount',
      1,
    );

    return isPlayerCountIncreased;
  };

  /**
   * Updates one player data
   * @param updateInfo data to update
   * @param options required options of the query
   * @returns tuple in form [ isSuccess, errors ]
   */
  async updatePlayerById(_id: string, updateInfo: UpdateQuery<Player>) {
    return this.basicService.updateOneById(_id, updateInfo);
  }

  public deleteOnePostHook: PostHookFunction = async (
    input: any,
    oldDoc: Partial<Player>,
  ): Promise<boolean> => {
    const clan_id = oldDoc.clan_id;

    if (!clan_id) return true;

    const isPlayerCountDecreased =
      await this.requestHelperService.changeCounterValue(
        ModelName.CLAN,
        { _id: clan_id },
        'playerCount',
        -1,
      );

    return isPlayerCountDecreased;
  };

  /**
   * Gets the clan ID of the player.
   *
   * @param playerId - The ID of the player.
   * @returns The clan ID of the player or undefined if not set.
   * @throws Will throw if there are errors reading the player document.
   */
  async getPlayerClanId(playerId: string) {
    const [player, playerErrors] = await this.getPlayerById(playerId, {
      includeRefs: [ModelName.CLAN],
    });
    if (playerErrors) throw playerErrors;

    return player.clan_id?.toString();
  }

  private clearClanReferences = async (
    _id: string,
  ): Promise<boolean | Error> => {
    const clansWithPlayerAsAdmin =
      await this.requestHelperService.getModelInstanceByCondition(
        ModelName.CLAN,
        { admin_ids: { $in: [_id] } },
        ClanDto,
      );

    if (!clansWithPlayerAsAdmin || clansWithPlayerAsAdmin.length === 0)
      return true;

    //Check that there will be no clans left without admins
    let isLastAdminNonEmptyClan = false;
    let clan_idLastAdmin: string;
    for (let i = 0; i < clansWithPlayerAsAdmin.length; i++) {
      const currentClan = clansWithPlayerAsAdmin[i];
      if (currentClan.admin_ids.length === 1) {
        const clanPlayers = await this.requestHelperService.count(
          ModelName.PLAYER,
          { clan_id: currentClan._id },
        );
        isLastAdminNonEmptyClan = clanPlayers > 1;
        clan_idLastAdmin = currentClan._id;
        break;
      }
    }

    if (isLastAdminNonEmptyClan)
      return new Error(
        `Player can not be deleted, because it is the only one admin in a non empty clan with _id '${clan_idLastAdmin}'. ` +
          `Please add another admin to this clan before deleting this Player or delete this clan first.`,
      );

    for (let i = 0; i < clansWithPlayerAsAdmin.length; i++) {
      const currentClan = clansWithPlayerAsAdmin[i];
      const newAdmin_ids = currentClan.admin_ids.filter(
        (value) => value !== _id,
      );
      await this.requestHelperService.updateOneById(
        ModelName.CLAN,
        currentClan._id,
        { admin_ids: newAdmin_ids },
      );
    }

    return true;
  };

  /**
   * Increments the points, played and won battles of a specified player based on the battle outcome.
   *
   * @param playerId - ID of the player to be updated.
   * @param playerWon - A boolean indicating whether the player won or not.
   * @throws - Will throw if the update operation fails.
   */
  async handlePlayedBattle(playerId: string, playerWon: boolean) {
    const points = playerWon ? 50 : 10;
    const update = {
      $inc: { 'gameStatistics.playedBattles': 1, points: points },
    };
    if (playerWon) update.$inc['gameStatistics.wonBattles'] = 1;

    const [_, updateErrors] = await this.basicService.updateOneById(
      playerId,
      update,
    );
    if (updateErrors) throw updateErrors;
  }
}
