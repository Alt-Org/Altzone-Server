import Counter from "../../../../../common/service/counter/Counter";
import Factory from "../../../../clan_module/data/factory";
import ClanModule from "../../../../clan_module/modules/clan.module";
import { getNonExisting_id } from "../../../../test_utils/util/getNonExisting_id";

describe('Counter.increaseById() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const counter = new Counter({ model: clanModel, counterField: 'playerCount' });
    const clanCreateBuilder = Factory.getBuilder('Clan');

    const startingValue = 10;
    const existingClan = clanCreateBuilder.setPlayerCount(startingValue).build();
    let existingClan_id: string;

    beforeEach(async () => {
        const dbResp = await clanModel.create(existingClan);
        existingClan_id = dbResp._id.toString();
    });

    it('Should increase the value by the specified amount and return true', async () => {
        const increaseAmount = 4;
        const isUpdated = await counter.increaseById(existingClan_id, increaseAmount);

        const dbObject = await clanModel.findById(existingClan_id);
        const expectedValue = startingValue + increaseAmount;

        expect(isUpdated).toBeTruthy();
        expect(dbObject.playerCount).toBe(expectedValue);
    });

    it('Should use the absolute value of the specified amount and still increase the value', async () => {
        const negativeIncreaseAmount = -2;
        const isUpdated = await counter.increaseById(existingClan_id, negativeIncreaseAmount);

        const dbObject = await clanModel.findById(existingClan_id);
        const expectedValue = startingValue + Math.abs(negativeIncreaseAmount);

        expect(isUpdated).toBeTruthy();
        expect(dbObject.playerCount).toBe(expectedValue);
    });

    it('Should return false if the object does not exist in DB', async () => {
        const increaseAmount = 3;
        const nonExisting_id = getNonExisting_id(existingClan_id);
        const isUpdated = await counter.increaseById(nonExisting_id, increaseAmount);

        expect(isUpdated).toBeFalsy();
    });
});