import GameEventBuilder from './gameEventsHandler/GameEventBuilder';

type BuilderName = 'GameEvent';

type BuilderMap = {
    GameEvent: GameEventBuilder
};

export default class GameEventsHandlerBuilderFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'GameEvent':
                return new GameEventBuilder() as BuilderMap[T];
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}
