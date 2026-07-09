import { Injectable, forwardRef, Inject, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { CreateVotingDto } from './dto/createVoting.dto';
import { VoteChoice } from './enum/choiceType.enum';
import VotingNotifier from './voting.notifier';
import { StartVotingParams } from './type/startItemVoting.type';
import { Voting } from './schemas/voting.schema';
import { VotingDto } from './dto/voting.dto';
import ServiceError from '../common/service/basicService/ServiceError';
import { PlayerService } from '../player/player.service';
import { PlayerDto } from '../player/dto/player.dto';
import { Choice } from './type/choice.type';
import { GovernancePayload } from './type/governancePayload';
import { ClanService } from '../clan/clan.service';
import { alreadyVotedError } from './error/alreadyVoted.error';
import { votingExpiredError } from './error/votingExpired.error';
import { Vote } from './schemas/vote.schema';
import { ModelName } from '../common/enum/modelName.enum';
import { addVoteError } from './error/addVote.error';
import { TIServiceCreateOneOptions } from '../common/service/basicService/IService';
import { VotingType } from './enum/VotingType.enum';
import ClanHelperService from '../clan/utils/clanHelper.service';

type VotingWithNotificationRefs = VotingDto & { FleaMarketItem?: unknown };
type VotingNotificationSource = StartVotingParams | VotingWithNotificationRefs;

/**
 * Service responsible for managing the voting lifecycle, including item purchases,
 * price changes, and clan governance updates.
 */
@Injectable()
export class VotingService {
  constructor(
    @InjectModel(Voting.name) public readonly votingModel: Model<Voting>,
    private readonly notifier: VotingNotifier,
    private readonly playerService: PlayerService,
    @Optional()
    @Inject(forwardRef(() => ClanService))
    private readonly clanService: ClanService,
    @Optional() private readonly clanHelperService: ClanHelperService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.basicService = new BasicService(this.votingModel);
  }

  /** Underlying basic service for Voting model operations */
  public readonly basicService: BasicService;

  /**
   * Creates a new voting record.
   * @param voting - DTO containing the voting data.
   * @param options - Service create options.
   * @returns A promise resolving to the created VotingDto.
   */
  async createOne(
    voting: CreateVotingDto,
    options?: TIServiceCreateOneOptions,
  ) {
    return this.basicService.createOne<CreateVotingDto, VotingDto>(
      voting,
      options,
    );
  }

  /**
   * Starts a new voting process for items or roles.
   * Refactored to share the same notification and creation logic as governance.
   * @param params - Parameters defining the vote (voter, item, type, etc.).
   * @param session - (Optional) Mongoose client session for transactions.
   * @returns A promise resolving to the created voting and any errors.
   */
  async startVoting(
    params: StartVotingParams,
    session?: ClientSession,
  ): Promise<[VotingDto, ServiceError[]]> {
    const votingData = this.buildVotingData(params);
    const [voting, errors] = await this.basicService.createOne(votingData, {
      session,
    });

    if (errors) return [null, errors];

    const { voterPlayer } = params;
    this.notifier.newVoting(
      voting,
      this.buildVotingNotificationEntity(params),
      voterPlayer,
    );

    return [voting, null];
  }

  /**
   * Starts a governance-specific vote for updating clan roles or administrators.
   * @param params - Parameters including the clan ID and governance payload.
   * @param session - (Optional) Mongoose client session.
   * @returns A promise resolving to the created governance voting.
   */
  async startGovernanceVoting(
    params: {
      clanId: string;
      governancePayload: GovernancePayload;
      voterPlayer: PlayerDto;
    },
    session?: ClientSession,
  ): Promise<[VotingDto, ServiceError[]]> {
    const votingParams = {
      voterPlayer: params.voterPlayer,
      type: VotingType.CLAN_GOVERNANCE_UPDATE,
      clanId: params.clanId,
      governancePayload: params.governancePayload,
    } as StartVotingParams;
    const votingData = this.buildVotingData(votingParams);

    const [voting, errors] = await this.basicService.createOne<
      CreateVotingDto,
      VotingDto
    >(votingData as CreateVotingDto, { session });

    if (errors) {
      console.error('VOTING_CREATE_ERROR:', errors);
      return [null, errors];
    }

    this.notifier.newVoting(
      voting,
      this.buildVotingNotificationEntity(votingParams),
      params.voterPlayer,
    );

    return [voting, null];
  }

  /**
   * Builds the entity part of the voting notification payload.
   * Supports both start params and persisted voting DTOs so new/update/end
   * notifications describe each voting type consistently.
   */
  private buildVotingNotificationEntity(
    source: VotingNotificationSource,
  ): unknown {
    const isStartParams = this.isStartVotingParams(source);

    switch (source.type) {
      case VotingType.FLEA_MARKET_BUY_ITEM:
      case VotingType.FLEA_MARKET_SELL_ITEM:
        return this.buildFleaMarketVotingEntity(source);
      case VotingType.FLEA_MARKET_CHANGE_ITEM_PRICE:
        return {
          fleaMarketItem: this.buildFleaMarketVotingEntity(source),
          price: isStartParams ? source.newItemPrice : source.price,
        };
      case VotingType.SHOP_BUY_ITEM:
        return {
          shopItemName: isStartParams ? source.shopItem : source.shopItemName,
        };
      case VotingType.SET_CLAN_ROLE:
        return source.setClanRole;
      case VotingType.CLAN_GOVERNANCE_UPDATE:
        return source.governancePayload;
    }
  }

  private buildFleaMarketVotingEntity(
    source: VotingNotificationSource,
  ): unknown {
    if (this.isStartVotingParams(source)) return source.fleaMarketItem;

    return (
      source.FleaMarketItem ?? {
        fleaMarketItem_id: source.fleaMarketItem_id?.toString(),
      }
    );
  }

  private isStartVotingParams(
    source: VotingNotificationSource,
  ): source is StartVotingParams {
    return 'voterPlayer' in source;
  }

  /**
   * Finalizes a governance vote. If the vote passed, it triggers the
   * ClanService to apply the changes to the database.
   * @param voting - The voting DTO to finalize.
   */
  async finalizeGovernanceVote(voting: VotingDto): Promise<void> {
    const isSuccess = await this.checkVotingSuccess(voting);

    if (isSuccess && voting.type === VotingType.CLAN_GOVERNANCE_UPDATE) {
      if (!voting.governancePayload) return;

      await this.clanService.applyGovernance(
        voting.organizer.clan_id,
        voting.governancePayload,
      );

      await this.finalizeVoting(voting._id);
    }
  }

  /**
   * Marks a voting as ended by setting the endedAt timestamp.
   * @param votingId - The ID of the voting to finalize.
   */
  async finalizeVoting(votingId: string): Promise<void> {
    const endedAt = new Date();
    const updateResult = await this.votingModel.updateOne(
      {
        _id: votingId,
        $or: [{ endedAt: { $exists: false } }, { endedAt: null }],
      },
      {
        $set: { endedAt },
      },
    );

    if (updateResult.modifiedCount === 0) return;

    const [endedVoting, errors] =
      await this.basicService.readOneById<VotingWithNotificationRefs>(
        votingId,
        {
          includeRefs: [ModelName.FLEA_MARKET_ITEM],
        },
      );
    if (errors || !endedVoting) return;

    this.notifier.votingCompleted(
      endedVoting,
      this.buildVotingNotificationEntity(endedVoting),
    );
  }

  /**
   * Builds the voting data object based on the voting type.
   * Includes safety checks for governance mapping and default expiry times.
   * @param params - Parameters for starting the vote.
   * @returns A partial CreateVotingDto.
   */
  private buildVotingData(params: StartVotingParams): Partial<CreateVotingDto> {
    const {
      voterPlayer,
      type,
      clanId,
      fleaMarketItem,
      shopItem,
      setClanRole,
      endsOn,
      newItemPrice,
      governancePayload,
    } = params;

    const organizer = {
      player_id: voterPlayer._id.toString(),
      clan_id: clanId?.toString(),
    };

    const base = {
      organizer,
      type,
      endsOn: endsOn || new Date(Date.now() + 10 * 60 * 1000),
      minPercentage: 51,
      votes: [{ player_id: organizer.player_id, choice: VoteChoice.YES }],
    } as Partial<CreateVotingDto>;

    switch (type) {
      case VotingType.FLEA_MARKET_BUY_ITEM:
      case VotingType.FLEA_MARKET_SELL_ITEM:
        base.fleaMarketItem_id = fleaMarketItem._id.toString();
        break;
      case VotingType.FLEA_MARKET_CHANGE_ITEM_PRICE:
        base.fleaMarketItem_id = fleaMarketItem._id.toString();
        base.price = newItemPrice;
        break;
      case VotingType.SHOP_BUY_ITEM:
        base.shopItemName = shopItem;
        break;
      case VotingType.SET_CLAN_ROLE:
        base.setClanRole = {
          player_id: setClanRole.player_id.toString(),
          role_id: setClanRole.role_id.toString(),
        };
        break;
      case VotingType.CLAN_GOVERNANCE_UPDATE:
        if (governancePayload) {
          base.governancePayload = {
            roles:
              governancePayload.roles?.map((role) => ({
                name: role.name,
                rights: role.rights,
              })) || [],
            admin_idsToAdd: governancePayload.admin_idsToAdd || [],
            admin_idsToDelete: governancePayload.admin_idsToDelete || [],
          };
        }
        break;
    }

    return base;
  }

  /**
   * Calculates if the voting has met the required percentage for success.
   * @param voting - The voting data to check.
   * @returns A promise resolving to true if successful.
   */
  async checkVotingSuccess(
    voting: VotingDto,
    useClanMajority: boolean = false,
  ): Promise<boolean> {
    const yesVotes = voting.votes.filter(
      (v) => v.choice === VoteChoice.YES,
    ).length;

    let divisor = voting.votes.length;

    if (useClanMajority && voting.organizer?.clan_id && this.clanService) {
      const [clan] = await this.clanService.readOneById(
        voting.organizer.clan_id,
      );
      if (clan) {
        divisor = clan.playerCount;
      }
    }

    if (divisor === 0) return false;

    return (yesVotes / divisor) * 100 >= (voting.minPercentage || 51);
  }

  /**
   * Validates if a player has permission to participate in a specific vote.
   * @param votingId - The ID of the vote.
   * @param playerId - The ID of the player to validate.
   * @returns A promise resolving to true if permitted.
   */
  async validatePermission(votingId: string, playerId: string) {
    const [voting, errors] =
      await this.basicService.readOneById<VotingDto>(votingId);
    if (errors) throw errors;
    if (!voting.organizer.clan_id) return true;
    const clanId = await this.playerService.getPlayerClanId(playerId);
    return clanId === voting.organizer.clan_id;
  }

  /**
   * Adds a player's vote to an active voting process.
   * Triggers finalization logic if the vote causes the process to succeed.
   * @param votingId - The ID of the vote.
   * @param choice - The player's choice (YES/NO).
   * @param playerId - The ID of the voting player.
   */
  async addVote(votingId: string, choice: Choice, playerId: string) {
    const [voting, errors] = await this.basicService.readOneById(votingId, {
      includeRefs: [ModelName.FLEA_MARKET_ITEM],
    });
    if (errors) throw errors;

    // Reject votes outright on expired votings
    if (voting.endedAt) {
      throw votingExpiredError;
    }
    if (voting.endsOn && new Date(voting.endsOn) < new Date()) {
      throw votingExpiredError;
    }

    // Check if the player has already voted in this voting
    if (voting.votes.some((v) => v.player_id.toString() === playerId)) {
      throw alreadyVotedError;
    }

    const [voter, voterErrors] =
      await this.playerService.getPlayerById(playerId);
    if (voterErrors) throw voterErrors;

    const newVote: Vote = { player_id: playerId, choice };

    const success = await this.basicService.updateOneById(votingId, {
      votes: [...voting.votes, newVote],
    });
    if (!success) throw addVoteError;

    // IMPORTANT:
    // Read the voting again after updating votes.
    // The original `voting` variable does not contain the newly added vote.
    const [updatedVoting] =
      await this.basicService.readOneById<VotingWithNotificationRefs>(
        votingId,
        {
          includeRefs: [ModelName.FLEA_MARKET_ITEM],
        },
      );

    // IMPORTANT:
    // If the voting has already passed after this vote, finalize it now.
    const isFleaMarketVoting = [
      VotingType.FLEA_MARKET_BUY_ITEM,
      VotingType.FLEA_MARKET_SELL_ITEM,
      VotingType.FLEA_MARKET_CHANGE_ITEM_PRICE,
    ].includes(updatedVoting.type);

    if (await this.checkVotingSuccess(updatedVoting, isFleaMarketVoting)) {
      if (updatedVoting.type === VotingType.CLAN_GOVERNANCE_UPDATE) {
        await this.finalizeGovernanceVote(updatedVoting);
      } else if (updatedVoting.type === VotingType.SET_CLAN_ROLE) {
        await this.finalizeSetClanRoleVote(updatedVoting);
        await this.finalizeVoting(updatedVoting._id);
      } else {
        await this.finalizeVoting(updatedVoting._id);
      }

      // Emit event for immediate processing in other services (e.g. FleaMarketService)
      this.eventEmitter.emit('voting.passed', { voting: updatedVoting });
    }

    this.notifier.votingUpdated(
      updatedVoting,
      this.buildVotingNotificationEntity(updatedVoting),
      voter,
    );
  }

  private async finalizeSetClanRoleVote(voting: VotingDto): Promise<void> {
    if (!voting.setClanRole?.player_id || !voting.setClanRole?.role_id) return;

    const [, updateErrors] = await this.playerService.updatePlayerById(
      voting.setClanRole.player_id.toString(),
      { clanRole_id: voting.setClanRole.role_id.toString() },
    );
    if (updateErrors) throw updateErrors;
  }

  /**
   * Retrieves all active and past votings relevant to a player's clan.
   * @param playerId - The ID of the player.
   * @returns A promise resolving to a list of votings.
   */
  async getClanVotings(playerId: string) {
    const clanId = await this.playerService.getPlayerClanId(playerId);
    const filter = {
      $or: [
        { 'organizer.clan_id': clanId },
        { 'organizer.player_id': playerId },
      ],
    };
    return this.basicService.readMany<VotingDto>({
      filter,
      sort: { endsOn: -1 },
    });
  }
}
