import GameEventBuilder from './gameEventsEmitter/GameEventBuilder';

type BuilderName = 'GameEvent';

type BuilderMap = {
    GameEvent: GameEventBuilder<any>
};

export default class GameEventsEmitterBuilderFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'GameEvent':
                return new GameEventBuilder() as BuilderMap[T];
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}
