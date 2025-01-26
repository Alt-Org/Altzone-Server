import CreatePlayerDtoBuilder from "./player/createPlayerDtoBuilder";
import PlayerDtoBuilder from "./player/playerDtoBuilder";
import UpdatePlayerDtoBuilder from "./player/updatePlayerDtoBuilder";
import PlayerBuilder from "./player/playerBuilder";
import GameStatisticsBuilder from "./player/gameStatisticsBuilder";

type BuilderName =
    'CreatePlayerDto' | 'PlayerDto' | 'UpdatePlayerDto' | 'Player' | 'GameStatistics';

type BuilderMap = {
    CreatePlayerDto: CreatePlayerDtoBuilder,
    PlayerDto: PlayerDtoBuilder,
    UpdatePlayerDto: UpdatePlayerDtoBuilder,
    Player: PlayerBuilder,
    GameStatistics: GameStatisticsBuilder
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
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}