import IDataBuilder from '../../../test_utils/interface/IDataBuilder.js';
import { StartVotingParams } from '../../../../voting/type/startItemVoting.type.js';
import { PlayerDto } from '../../../../player/dto/player.dto.js';
import { FleaMarketItemDto } from '../../../../fleaMarket/dto/fleaMarketItem.dto.js';
import { VotingType } from '../../../../voting/enum/VotingType.enum';
import { ObjectId } from 'mongodb';
import { AgeRange } from '../../../../clan/enum/ageRange.enum';
import { Goal } from '../../../../clan/enum/goal.enum';
import { Language } from '../../../../common/enum/language.enum';
import { VotingQueueName } from '../../../../voting/enum/VotingQueue.enum.js';

export default class CreateStartItemVotingParamsDtoBuilder
  implements IDataBuilder<StartVotingParams>
{
  private readonly base: Partial<StartVotingParams> = {
    voterPlayer: {
      _id: new ObjectId().toString(),
      name: '',
      points: 0,
      battlePoints: 0,
      backpackCapacity: 0,
      uniqueIdentifier: '',
      parentalAuth: false,
      gameStatistics: null,
      profile_id: new ObjectId().toString(),
      clan_id: new ObjectId().toString(),
      Clan: {
        _id: new ObjectId().toString(),
        name: 'clan-1',
        tag: 'tag-1',
        clanLogo: null,
        labels: [],
        gameCoins: 0,
        points: 0,
        admin_ids: [],
        playerCount: 0,
        itemCount: 0,
        stockCount: 0,
        ageRange: AgeRange.ADULTS,
        goal: Goal.FIILISTELY,
        phrase: '',
        language: Language.ENGLISH,
        isOpen: false,
        Player: [],
        Stock: null,
        SoulHome: null,
        roles: [],
      },
      CustomCharacter: [],
    },
    clanId: undefined,
    type: undefined,
    queue: undefined,
  };

  build(): StartVotingParams {
    if (!this.base.voterPlayer) {
      throw new Error('Player is required but not set.');
    }
    return { ...this.base } as StartVotingParams;
  }

  setPlayer(player: PlayerDto) {
    this.base.voterPlayer = player;
    return this;
  }

  setItem(item: FleaMarketItemDto) {
    this.base.fleaMarketItem = item;
    return this;
  }

  setType(type: VotingType) {
    this.base.type = type;
    return this;
  }

  setQueue(name: VotingQueueName) {
    this.base.queue = name;
    return this;
  }

  setClanId(clanId: string | ObjectId) {
    this.base.clanId = clanId.toString();
    return this;
  }
}
