import {ClanEventHandler} from "../../../gameEventsHandler/clanEventHandler";
import GameEventsHandlerModule from "../modules/gameEventsHandler.module";
import DailyTasksModule from "../../dailyTasks/modules/dailyTasks.module";
import GameEventsEmitterBuilderFactory from "../../gameEventsEmitter/data/gameEventsEmitterBuilderFactory";
import {ObjectId} from "mongodb";
import GameEventBuilder from "../../gameEventsEmitter/data/gameEventsEmitter/GameEventBuilder";
import {GameEventPayload} from "../../../gameEventsEmitter/gameEvent";
import {uiDailyTasks} from "../../../dailyTasks/uiDailyTasks/uiDailyTasks";

describe('ClanEventHandler.handleClanCreation() test suite', () => {
    let clanEventHandler: ClanEventHandler;

    const eventPayloadBuilder: GameEventBuilder<'clan.create'> = GameEventsEmitterBuilderFactory.getBuilder('GameEvent');

    const dailyTaskModel = DailyTasksModule.getDailyTaskModel();

    beforeEach(async () => {
        clanEventHandler = await GameEventsHandlerModule.getClanEventHandler();
    });

    it('Should create all UI daily tasks for the clan', async () => {
        const eventPayload = eventPayloadBuilder
            .setEventName('clan.create').setInfo({clan_id: new ObjectId()})
            .build() as GameEventPayload<'clan.create'>;

        await clanEventHandler.handleClanCreation(eventPayload);

        const dailyTasks = await dailyTaskModel.find({clan_id: eventPayload.info.clan_id}).exec();
        const uiTasks = dailyTasks.filter(task => uiDailyTasks[task.type] != null);

        expect(uiTasks).toHaveLength(Object.keys(uiDailyTasks).length);
    });

    it('Should create 20 server daily tasks for the clan', async () => {
        const eventPayload = eventPayloadBuilder
            .setEventName('clan.create').setInfo({clan_id: new ObjectId()})
            .build() as GameEventPayload<'clan.create'>;

        await clanEventHandler.handleClanCreation(eventPayload);

        const dailyTasks = await dailyTaskModel.find({clan_id: eventPayload.info.clan_id}).exec();
        const serverTasks = dailyTasks.filter(task => uiDailyTasks[task.type] == null);

        expect(serverTasks).toHaveLength(20);
    });

    it('Should throw if clan_id is not provided', async () => {
        const eventPayload = eventPayloadBuilder
            .setEventName('clan.create').setInfo({clan_id: null})
            .build() as GameEventPayload<'clan.create'>;

        const throwingCall = async () => clanEventHandler.handleClanCreation(eventPayload);

        await expect(throwingCall).rejects.toThrow();
    });
});