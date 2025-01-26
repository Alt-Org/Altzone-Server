import ClanBuilderFactory from "../data/clanBuilderFactory";
import ClanModule from "../modules/clan.module";
import {PlayerCounterFactory} from "../../../clan/clan.counters";
import Counter from "../../../common/service/counter/Counter";

describe('PlayerCounterFactory.create() test suite', () => {
    let playerCounterFactory: PlayerCounterFactory;
    let clanCounter: Counter;
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanModel = ClanModule.getClanModel();

    const clanName = 'clan1';
    const startingPlayerCount = 5;
    const existingClan = clanBuilder
        .setName(clanName)
        .setPlayerCount(startingPlayerCount)
        .build();

    beforeEach(async () => {
        playerCounterFactory = await ClanModule.getPlayerCounterFactory();
        clanCounter = playerCounterFactory.create();
        const createdClan = await clanModel.create(existingClan);
        existingClan._id = createdClan._id;
    });

    it('Should return counter that decrease the playerCount for specified clan by specified amount', async () => {
        const clanFilter = { name: clanName };
        const decreaseAmount = 2;
        await clanCounter.decrease(clanFilter, decreaseAmount);

        const updatedClan = await clanModel.findOne(clanFilter);
        expect(updatedClan.playerCount).toBe(startingPlayerCount-decreaseAmount);
    });
    it('Should return counter that decrease the playerCount for clan with specified id by specified amount', async () => {
        const decreaseAmount = 2;
        await clanCounter.decreaseById(existingClan._id, decreaseAmount);

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.playerCount).toBe(startingPlayerCount-decreaseAmount);
    });

    it('Should return counter that decrease the playerCount for specified clan by one', async () => {
        const clanFilter = { name: clanName };
        await clanCounter.decreaseOnOne(clanFilter);

        const updatedClan = await clanModel.findOne(clanFilter);
        expect(updatedClan.playerCount).toBe(startingPlayerCount-1);
    });
    it('Should return counter that decrease the playerCount for clan with specified id by one', async () => {
        await clanCounter.decreaseByIdOnOne(existingClan._id);

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.playerCount).toBe(startingPlayerCount-1);
    });


    it('Should return counter that increase the playerCount for specified clan by specified amount', async () => {
        const clanFilter = { name: clanName };
        const increaseAmount = 2;
        await clanCounter.increase(clanFilter, increaseAmount);

        const updatedClan = await clanModel.findOne(clanFilter);
        expect(updatedClan.playerCount).toBe(startingPlayerCount+increaseAmount);
    });
    it('Should return counter that increase the playerCount for clan with specified id by specified amount', async () => {
        const increaseAmount = 2;
        await clanCounter.increaseById(existingClan._id, increaseAmount);

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.playerCount).toBe(startingPlayerCount+increaseAmount);
    });

    it('Should return counter that increase the playerCount for specified clan by one', async () => {
        const clanFilter = { name: clanName };
        await clanCounter.increaseOnOne(clanFilter);

        const updatedClan = await clanModel.findOne(clanFilter);
        expect(updatedClan.playerCount).toBe(startingPlayerCount+1);
    });
    it('Should return counter that increase the playerCount for clan with specified id by one', async () => {
        await clanCounter.increaseByIdOnOne(existingClan._id);

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan.playerCount).toBe(startingPlayerCount+1);
    });
});