import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { ReactionDto } from '../../../../chat/dto/reaction.dto';

export default class ReactionDtoBuilder implements IDataBuilder<ReactionDto> {
  private readonly base: ReactionDto = {
    playerName: 'TestPlayer420',
    emoji: '👍',
  };

  build(): ReactionDto {
    return { ...this.base };
  }

  setPlayerName(name: string) {
    this.base.playerName = name;
    return this;
  }

  setEmoji(emoji: string) {
    this.base.emoji = emoji;
    return this;
  }
}
