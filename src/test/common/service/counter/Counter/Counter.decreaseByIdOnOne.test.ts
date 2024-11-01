import Counter from "../../../../../common/service/counter/Counter";
import Factory from "../../../../clan_module/data/factory";
import ClanModule from "../../../../clan_module/modules/clan.module";
import { getNonExisting_id } from "../../../../test_utils/util/getNonExisting_id";

describe('Counter.decreaseByIdOnOne() test suite', () => {
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

    it('Should decrease the value by 1 and return true if the object exists in DB', async () => {
        const isUpdated = await counter.decreaseByIdOnOne(existingClan_id);

        const dbObject = await clanModel.findById(existingClan_id);
        const expectedValue = startingValue - 1;

        expect(isUpdated).toBeTruthy();
        expect(dbObject.playerCount).toBe(expectedValue);
    });

    it('Should return false if the object does not exist in DB', async () => {
        const nonExisting_id = getNonExisting_id(existingClan_id);
        const isUpdated = await counter.decreaseByIdOnOne(nonExisting_id);

        expect(isUpdated).toBeFalsy();
    });

    it('Should not decrease the value if it would go below 0 and return false', async () => {
        await clanModel.updateOne({ _id: existingClan_id }, { playerCount: 0 });

        const isUpdated = await counter.decreaseByIdOnOne(existingClan_id);

        const dbObject = await clanModel.findById(existingClan_id);

        expect(isUpdated).toBeFalsy();
        expect(dbObject.playerCount).toBe(0);
    });
});