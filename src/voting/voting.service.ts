import { Injectable } from '@nestjs/common';
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
import { Choice } from './type/choice.type';
import { alreadyVotedError } from './error/alreadyVoted.error';
import { Vote } from './schemas/vote.schema';
import { ModelName } from '../common/enum/modelName.enum';
import { addVoteError } from './error/addVote.error';
import { TIServiceCreateOneOptions } from '../common/service/basicService/IService';
import { VotingType } from './enum/VotingType.enum';

@Injectable()
export class VotingService {
  constructor(
    @InjectModel(Voting.name) public readonly votingModel: Model<Voting>,
    private readonly notifier: VotingNotifier,
    private readonly playerService: PlayerService,
  ) {
    this.basicService = new BasicService(this.votingModel);
  }

  public readonly basicService: BasicService;

  /**
   * Creates a new voting entry.
   *
   * @param voting - The data transfer object containing the details of the voting to be created.
   * @returns A promise that resolves to the created voting entity.
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
   * Initiates a new voting process for an item.
   * Creates a new voting entry and sends a MQTT notification.
   *
   * @param params - The parameters for starting the item voting.
   * @param session - Optional session for transaction support.
   *
   * @throws - Throws an error if validation fails or if there are errors creating the voting.
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

    const { shopItem, fleaMarketItem, setClanRole, voterPlayer } = params;
    this.notifier.newVoting(
      voting,
      shopItem ?? fleaMarketItem ?? setClanRole,
      voterPlayer,
    );

    return [voting, null];
  }

  /**
   * Builds the voting data object based on the provided parameters.
   *
   * This method constructs a voting DTO for different voting types, initializing
   * the organizer, vote choices, and additional properties depending on the voting type.
   *
   * @param params - The parameters required to start a voting process, including voter player,
   *   voting type, clan ID, item details, role settings, and voting end time.
   * @returns The constructed voting data object to be used for creating a voting entry.
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
    } = params;

    const organizer = {
      player_id: voterPlayer?._id.toString(),
      clan_id: clanId?.toString(),
    };

    const base = {
      organizer,
      type,
      endsOn,
      votes: [{ player_id: organizer.player_id, choice: VoteChoice.YES }],
    } as Partial<CreateVotingDto>;

    switch (type) {
      case VotingType.FLEA_MARKET_BUY_ITEM:
      case VotingType.FLEA_MARKET_SELL_ITEM:
        base.fleaMarketItem_id = fleaMarketItem._id.toString();
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
    }

    return base;
  }

  /**
   * Checks if the voting has been successful.
   *
   * @param voting - The voting data to check.
   * @returns A boolean indicating whether the voting has been successful.
   */
  async checkVotingSuccess(voting: VotingDto) {
    const yesVotes = voting.votes.filter(
      (vote) => vote.choice === VoteChoice.YES,
    ).length;
    const totalVotes = voting.votes.length;
    const yesPercentage = (yesVotes / totalVotes) * 100;

    return yesPercentage >= voting.minPercentage;
  }

  /**
   * Validates that player can use the voting.
   * Checks that voting isn't clan specific or
   * voting organizer clan matches with player clan.
   *
   * @param votingId - The ID of the voting.
   * @param playerId - The ID of the player.
   * @returns True if player can use the voting and false is not.
   * @throws If there is an error fetching from DB.
   */
  async validatePermission(votingId: string, playerId: string) {
    const [voting, errors] =
      await this.basicService.readOneById<VotingDto>(votingId);
    if (errors) throw errors;

    if (!voting.organizer.clan_id) return true;

    const clanId = await this.playerService.getPlayerClanId(playerId);
    if (clanId === voting.organizer.clan_id) return true;

    return false;
  }

  /**
   * Adds a new vote to a voting.
   *
   * @param votingId - The ID of the voting.
   * @param choice - The choice to vote for.
   * @param playerId - The ID of the voter.
   * @throws Throws if there is an error reading from DB.
   */
  async addVote(votingId: string, choice: Choice, playerId: string) {
    const [voting, errors] = await this.basicService.readOneById(votingId, {
      includeRefs: [ModelName.PLAYER, ModelName.FLEA_MARKET_ITEM],
    });
    if (errors) throw errors;

    voting.votes.forEach((vote) => {
      if (vote.player_id === playerId) throw alreadyVotedError;
    });

    const newVote: Vote = { player_id: playerId, choice };
    const success = await this.basicService.updateOneById(votingId, {
      votes: [...voting.votes, newVote],
    });
    if (!success) throw addVoteError;

    this.notifier.votingUpdated(voting, voting.FleaMarketItem, voting.Player);
  }

  /**
   * Get all votings where the organizer is the player or player's clan.
   *
   * @param playerId - The ID of the player.
   * @returns All the found votings or service error.
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
    });
  }
}
