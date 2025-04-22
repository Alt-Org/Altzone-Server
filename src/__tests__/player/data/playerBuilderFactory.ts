import CreatePlayerDtoBuilder from './player/createPlayerDtoBuilder';
import PlayerDtoBuilder from './player/playerDtoBuilder';
import UpdatePlayerDtoBuilder from './player/updatePlayerDtoBuilder';
import PlayerBuilder from './player/playerBuilder';
import GameStatisticsBuilder from './player/gameStatisticsBuilder';
import CreateCustomCharacterDtoBuilder from './customCharacter/CreateCustomCharacterDtoBuilder';
import CustomCharacterBuilder from './customCharacter/CustomCharacterBuilder';
import UpdateCustomCharacterDtoBuilder from './customCharacter/UpdateCustomCharacterDtoBuilder';
import MessageBuilder from './message/MessageBuilder';

type BuilderName =
  | 'CreatePlayerDto'
  | 'PlayerDto'
  | 'UpdatePlayerDto'
  | 'Player'
  | 'GameStatistics'
  | 'CreateCustomCharacterDto'
  | 'CustomCharacter'
  | 'UpdateCustomCharacterDto'
  | 'Message';

type BuilderMap = {
  CreatePlayerDto: CreatePlayerDtoBuilder;
  PlayerDto: PlayerDtoBuilder;
  UpdatePlayerDto: UpdatePlayerDtoBuilder;
  Player: PlayerBuilder;
  GameStatistics: GameStatisticsBuilder;
  CreateCustomCharacterDto: CreateCustomCharacterDtoBuilder;
  CustomCharacter: CustomCharacterBuilder;
  UpdateCustomCharacterDto: UpdateCustomCharacterDtoBuilder;
  Message: MessageBuilder;
};

export default class PlayerBuilderFactory {
  static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
    switch (builderName) {
      case 'CreatePlayerDto':
        return new CreatePlayerDtoBuilder() as BuilderMap[T];
      case 'PlayerDto':
        return new PlayerDtoBuilder() as BuilderMap[T];
      case 'UpdatePlayerDto':
        return new UpdatePlayerDtoBuilder() as BuilderMap[T];
      case 'Player':
        return new PlayerBuilder() as BuilderMap[T];
      case 'GameStatistics':
        return new GameStatisticsBuilder() as BuilderMap[T];
      case 'CreateCustomCharacterDto':
        return new CreateCustomCharacterDtoBuilder() as BuilderMap[T];
      case 'CustomCharacter':
        return new CustomCharacterBuilder() as BuilderMap[T];
      case 'UpdateCustomCharacterDto':
        return new UpdateCustomCharacterDtoBuilder() as BuilderMap[T];
      case 'Message':
        return new MessageBuilder() as BuilderMap[T];
      default:
        throw new Error(`Unknown builder name: ${builderName}`);
    }
  }
}
