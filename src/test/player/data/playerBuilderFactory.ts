import CreatePlayerDtoBuilder from "./player/createPlayerDtoBuilder";
import PlayerDtoBuilder from "./player/playerDtoBuilder";

type BuilderName =
    'CreatePlayerDto' | 'PlayerDto';

type BuilderMap = {
    CreatePlayerDto: CreatePlayerDtoBuilder,
    PlayerDto: PlayerDtoBuilder
};

export default class PlayerBuilderFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'CreatePlayerDto':
                return new CreatePlayerDtoBuilder() as BuilderMap[T];
            case 'PlayerDto':
                return new PlayerDtoBuilder() as BuilderMap[T];
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}