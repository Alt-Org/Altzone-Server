import BasicService from "../../../../../common/service/basicService/BasicService";
import ClanModule from "../../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../../clan/data/clanBuilderFactory";


describe('BasicService.deleteOne() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');

    const existingClan = clanCreateBuilder.setName('clan1').build();
    let existingClan_id: string;

    beforeEach(async () => {
        const dbResp1 = await clanModel.create(existingClan);
        existingClan_id = dbResp1._id.toString();
    });

    it('Should delete the object that matches the provided filter from DB and return true', async () => {
        const filter = { name: existingClan.name };

        const [wasDeleted, errors] = await basicService.deleteOne({ filter });

        expect(errors).toBeNull();
        expect(wasDeleted).toBe(true);

        const deletedClan = await clanModel.findById(existingClan_id);
        expect(deletedClan).toBeNull();
    });

    it('Should return ServiceError NOT_FOUND if no object matches the provided filter', async () => {
        const filter = { name: 'non-existing-clan' };

        const [wasDeleted, errors] = await basicService.deleteOne({ filter });

        expect(wasDeleted).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if the filter is null or undefined', async () => {
        const nullInput = async () => await basicService.deleteOne({ filter: null });
        const undefinedInput = async () => await basicService.deleteOne({ filter: undefined });

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});