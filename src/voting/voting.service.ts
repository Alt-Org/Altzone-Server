import { Injectable, forwardRef, Inject, Optional } from '@nestjs/common';
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
import { Vote } from './schemas/vote.schema';
import { ModelName } from '../common/enum/modelName.enum';
import { addVoteError } from './error/addVote.error';
import { TIServiceCreateOneOptions } from '../common/service/basicService/IService';
import { VotingType } from './enum/VotingType.enum';
import ClanHelperService from '../clan/utils/clanHelper.service';

@Injectable()
export class VotingService {
  constructor(
    @InjectModel(Voting.name) public readonly votingModel: Model<Voting>,
    private readonly notifier: VotingNotifier,
    private readonly playerService: PlayerService,
    @Optional() @Inject(forwardRef(() => ClanService))
    private readonly clanService: ClanService,
    @Optional() private readonly clanHelperService: ClanHelperService
  ) {
    this.basicService = new BasicService(this.votingModel);
  }

  public readonly basicService: BasicService;

  async createOne(voting: CreateVotingDto, options?: TIServiceCreateOneOptions) {
    return this.basicService.createOne<CreateVotingDto, VotingDto>(voting, options);
  }

  /**
   * Refactored to share the same notification and creation logic as governance.
   */
  async startVoting(params: StartVotingParams, session?: ClientSession): Promise<[VotingDto, ServiceError[]]> {
    const votingData = this.buildVotingData(params);
    const [voting, errors] = await this.basicService.createOne(votingData, { session });
    
    if (errors) return [null, errors];

    const { shopItem, fleaMarketItem, setClanRole, voterPlayer } = params;
    this.notifier.newVoting(voting, shopItem ?? fleaMarketItem ?? setClanRole, voterPlayer);

    return [voting, null];
  }

  /**
   * Now uses buildVotingData and a Notifier.
   */
  async startGovernanceVoting(params: {
    clanId: string;
    governancePayload: GovernancePayload;
    voterPlayer: PlayerDto;
  }, session?: ClientSession): Promise<[VotingDto, ServiceError[]]> {
    
    const votingData = this.buildVotingData({
      voterPlayer: params.voterPlayer,
      type: VotingType.CLAN_GOVERNANCE_UPDATE,
      clanId: params.clanId,
      governancePayload: params.governancePayload,
    } as StartVotingParams); 

    const [voting, errors] = await this.basicService.createOne<CreateVotingDto, VotingDto>(
      votingData as CreateVotingDto, 
      { session }
    );

    if (errors) {
    console.error("VOTING_CREATE_ERROR:", errors);
    return [null, errors];
  }

    this.notifier.newVoting(voting, null, params.voterPlayer);

    return [voting, null];
  }

  async finalizeGovernanceVote(voting: VotingDto): Promise<void> {
    const isSuccess = await this.checkVotingSuccess(voting);
    
    if (isSuccess && voting.type === VotingType.CLAN_GOVERNANCE_UPDATE) {
      if (!voting.governancePayload) return;

      await this.clanService.applyGovernance(
        voting.organizer.clan_id, 
        voting.governancePayload
      );

      await this.basicService.updateOneById(voting._id, { endedAt: new Date() });
    }
  }

  /**
   * Added safety checks for governance mapping.
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
      governancePayload
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
            roles: governancePayload.roles?.map(role => ({
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
  
  async checkVotingSuccess(voting: VotingDto) {
    const yesVotes = voting.votes.filter(v => v.choice === VoteChoice.YES).length;
    const totalVotes = voting.votes.length;
    return (yesVotes / totalVotes) * 100 >= (voting.minPercentage || 51);
  }

  async validatePermission(votingId: string, playerId: string) {
    const [voting, errors] = await this.basicService.readOneById<VotingDto>(votingId);
    if (errors) throw errors;
    if (!voting.organizer.clan_id) return true;
    const clanId = await this.playerService.getPlayerClanId(playerId);
    return clanId === voting.organizer.clan_id;
  }

  async addVote(votingId: string, choice: Choice, playerId: string) {
    const [voting, errors] = await this.basicService.readOneById(votingId, {
      includeRefs: [ModelName.PLAYER, ModelName.FLEA_MARKET_ITEM],
    });
    if (errors) throw errors;

    if (voting.votes.some(v => v.player_id === playerId)) throw alreadyVotedError;

    const newVote: Vote = { player_id: playerId, choice };
    const success = await this.basicService.updateOneById(votingId, {
      votes: [...voting.votes, newVote],
    });
    if (!success) throw addVoteError;

    const [updatedVoting] = await this.basicService.readOneById<VotingDto>(votingId);
    if (await this.checkVotingSuccess(updatedVoting)) {
      await this.finalizeGovernanceVote(updatedVoting);
    }

    this.notifier.votingUpdated(voting, voting.FleaMarketItem, voting.Player);
  }

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