import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
import { VotingQueue } from './voting.queue';

@Injectable()
export class VotingService {
  constructor(
    @InjectModel(Voting.name) public readonly model: Model<Voting>,
    private readonly notifier: VotingNotifier,
    private readonly playerService: PlayerService,
    private readonly votingQueue: VotingQueue,
  ) {
    this.basicService = new BasicService(model);
  }

  public readonly basicService: BasicService;

  /**
   * Creates a new voting entry.
   *
   * @param voting - The data transfer object containing the details of the voting to be created.
   * @returns A promise that resolves to the created voting entity.
   */
  async createOne(voting: CreateVotingDto) {
    return this.basicService.createOne<CreateVotingDto, VotingDto>(voting);
  }

  /**
   * Initiates a new voting process for an item.
   * Creates a new voting entry and sends a MQTT notification.
   *
   * @param params - The parameters for starting the item voting.
   * @param playerId - The ID of the player initiating the voting.
   * @param itemId - The ID of the item being voted on.
   * @param clanId - The ID of the clan associated with the voting.
   * @param type - The type of voting, either for selling or buying an item.
   *
   * @throws - Throws an error if validation fails or if there are errors creating the voting.
   */
  async startVoting(
    params: StartVotingParams,
  ): Promise<[VotingDto, ServiceError[]]> {
    const {
      voterPlayer,
      type,
      queue,
      clanId,
      fleaMarketItem,
      shopItem,
      setClanRole,
      endsOn,
    } = params;

    const newVoting: CreateVotingDto = {
      organizer: { player_id: voterPlayer._id.toString(), clan_id: clanId },
      type,
      ...(fleaMarketItem && {
        fleaMarketItem_id: fleaMarketItem._id.toString(),
      }),
      ...(shopItem && { shopItemName: shopItem }),
      ...(setClanRole && { setClanRole }),
      ...(endsOn && { endsOn }),
    };

    const newVote = {
      player_id: voterPlayer._id.toString(),
      choice: VoteChoice.YES,
    };

    newVoting.votes = [newVote];

    const [voting, errors] = await this.createOne(newVoting);
    if (errors) return [null, errors];

    this.notifier.newVoting(voting, shopItem ?? fleaMarketItem, voterPlayer);

    this.votingQueue.addVotingCheckJob({
      voting,
      clanId,
      queue,
      ...(fleaMarketItem && {
        fleaMarketItemId: fleaMarketItem._id.toString(),
      }),
    });

    return [voting, null];
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
