import BasicService from "../../../../../common/service/basicService/BasicService";
import Factory from "../../../../clan_module/data/factory";
import ClanModule from "../../../../clan_module/modules/clan.module";


describe('BasicService.deleteMany() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = Factory.getBuilder('CreateClanDto');

    const clan1 = clanCreateBuilder.setName('clan1').build();
    const clan2 = clanCreateBuilder.setName('clan2').build();
    const clan3 = clanCreateBuilder.setName('clan3').build();

    beforeEach(async () => {
        await clanModel.create(clan1);
        await clanModel.create(clan2);
        await clanModel.create(clan3);
    });

    it('Should delete all objects that match the provided filter from DB and return true', async () => {
        const filter = { name: { $regex: 'clan' } };

        const [wasDeleted, errors] = await basicService.deleteMany({ filter });

        expect(errors).toBeNull();
        expect(wasDeleted).toBe(true);

        const deletedClans = await clanModel.find({ name: { $regex: 'clan' } });
        expect(deletedClans).toHaveLength(0);
    });

    it('Should return ServiceError NOT_FOUND if no objects match the provided filter', async () => {
        const filter = { name: 'non-existing-clan' };

        const [wasDeleted, errors] = await basicService.deleteMany({ filter });

        expect(wasDeleted).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if the filter is null or undefined', async () => {
        const nullInput = async () => await basicService.deleteMany({ filter: null });
        const undefinedInput = async () => await basicService.deleteMany({ filter: undefined });

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});