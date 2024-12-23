import BasicService from "../../../../../common/service/basicService/BasicService";
import Factory from "../../../../clan_module/data/factory";
import ClanModule from "../../../../clan_module/modules/clan.module";
import { getNonExisting_id } from "../../../../test_utils/util/getNonExisting_id";


describe('BasicService.deleteOneById() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = Factory.getBuilder('CreateClanDto');

    const existingClan = clanCreateBuilder.setName('clan1').build();
    let existingClan_id: string;

    beforeEach(async () => {
        const dbResp1 = await clanModel.create(existingClan);
        existingClan_id = dbResp1._id.toString();
    });

    it('Should delete the object from DB if the _id is valid and return true', async () => {
        const [wasDeleted, errors] = await basicService.deleteOneById(existingClan_id);

        expect(errors).toBeNull();
        expect(wasDeleted).toBe(true);

        const deletedClan = await clanModel.findById(existingClan_id);
        expect(deletedClan).toBeNull();
    });

    it('Should return ServiceError NOT_FOUND if the object with provided _id does not exist', async () => {
        const nonExisting_id = getNonExisting_id(existingClan_id);
        const [wasDeleted, errors] = await basicService.deleteOneById(nonExisting_id);

        expect(wasDeleted).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if input _id is null or undefined', async () => {
        const nullInput = async () => await basicService.deleteOneById(null);
        const undefinedInput = async () => await basicService.deleteOneById(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});