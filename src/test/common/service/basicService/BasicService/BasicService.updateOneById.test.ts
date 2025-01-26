import BasicService from "../../../../../common/service/basicService/BasicService";
import Factory from "../../../../clan_module/data/factory";
import ClanModule from "../../../../clan_module/modules/clan.module";
import { getNonExisting_id } from "../../../../test_utils/util/getNonExisting_id";


describe('BasicService.updateOneById() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = Factory.getBuilder('CreateClanDto');

    const existingClan = clanCreateBuilder.setName('clan1').build();
    let existingClan_id: string;

    beforeEach(async () => {
        const dbResp1 = await clanModel.create(existingClan);
        existingClan_id = dbResp1._id.toString();
    });

    it('Should update the object in the DB and return true if the input is valid', async () => {
        const updatedName = 'updatedClan';
        const updateData = { name: updatedName };

        const [wasUpdated, errors] = await basicService.updateOneById(existingClan_id, updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedClan = await clanModel.findById(existingClan_id);
        expect(updatedClan.name).toBe(updatedName);
    });

    it('Should return ServiceError NOT_FOUND if the object with the provided _id does not exist', async () => {
        const nonExisting_id = getNonExisting_id();
        const updateData = { name: 'updatedClan' };

        const [wasUpdated, errors] = await basicService.updateOneById(nonExisting_id, updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if _id or input are null or undefined', async () => {
        const nullInput = async () => await basicService.updateOneById(null, null);
        const undefinedInput = async () => await basicService.updateOneById(undefined, undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});