import BasicService from "../../../../../common/service/basicService/BasicService";
import ClanModule from "../../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../../clan/data/clanBuilderFactory";


describe('BasicService.updateMany() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');

    const clan1 = clanCreateBuilder.setName('clan1').build();
    const clan2 = clanCreateBuilder.setName('clan2').build();
    const clan3 = clanCreateBuilder.setName('clan3').build();
    let clan1_id: string;
    let clan2_id: string;
    let clan3_id: string;
    const clansFilter = { name: { $regex: 'clan' } };

    beforeEach(async () => {
        const dbResp1 = await clanModel.create(clan1);
        const dbResp2 = await clanModel.create(clan2);
        const dbResp3 = await clanModel.create(clan3);
        clan1_id = dbResp1._id.toString();
        clan2_id = dbResp2._id.toString();
        clan3_id = dbResp3._id.toString();
    });

    it('Should update all objects that match the provided filter', async () => {
        const updateData: any = { phrase: 'Some other phrase here' };

        const [wasUpdated, errors] = await basicService.updateMany(updateData, { filter: clansFilter });

        expect(errors).toBeNull();
        expect(wasUpdated).toBe(true);

        const updatedClans = await clanModel.find({ name: { $regex: 'clan' } });
        updatedClans.forEach(clan => {
            expect(clan).toHaveProperty('phrase', updateData.phrase);
        });
    });

    it('Should return ServiceError NOT_FOUND if no objects match the provided filter', async () => {
        const filter = { name: 'non-existing' };
        const updateData: any = { phrase: 'Some other phrase here' };

        const [wasUpdated, errors] = await basicService.updateMany(updateData, { filter });

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if input is null or undefined', async () => {
        const nullInput = async () => await basicService.updateMany(null, { filter: clansFilter });
        const undefinedInput = async () => await basicService.updateMany(undefined, { filter: clansFilter });

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});