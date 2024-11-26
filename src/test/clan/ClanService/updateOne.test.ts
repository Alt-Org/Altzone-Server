import {ClanService} from "../../../clan/clan.service";
import ClanBuilderFactory from "../data/clanBuilderFactory";
import {Clan} from "../../../clan/clan.schema";
import ClanModule from "../modules/clan.module";


describe('ClanService.updateOne() test suite', () => {
    let clanService: ClanService;
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanUpdateBuilder = ClanBuilderFactory.getBuilder('UpdateClanDto');
    const clanModel = ClanModule.getClanModel();

    const existingClanName = 'clan1';
    let existingClan: Clan;

    beforeEach(async () => {
        clanService = await ClanModule.getClanService();

        const clanToCreate = clanBuilder.setName(existingClanName).build();
        const clanResp = await clanModel.create(clanToCreate);
        existingClan = clanResp.toObject();
    });

    it('Should update the clan that matches the provided filter and return true', async () => {
        const filter = { name: existingClanName };
        const newName = 'updatedClan1';
        const updateData = clanUpdateBuilder.setName(newName).build();

        const [wasUpdated, errors] = await clanService.updateOne(updateData, { filter });

        expect(errors).toBeNull();
        expect(wasUpdated).toBe(true);

        const updatedClan = await clanModel.findById(existingClan._id);
        expect(updatedClan).toHaveProperty('name', newName);
    });

    it('Should return ServiceError NOT_FOUND if no clan matches the provided filter', async () => {
        const filter = { name: 'non-existing-clan' };
        const updateData = clanUpdateBuilder.setName('newName').build();

        const [wasUpdated, errors] = await clanService.updateOne(updateData, { filter });

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if update data is null or undefined', async () => {
        const nullInput = async () => await clanService.updateOne(null, { filter: { name: 'clan1' } });
        const undefinedInput = async () => await clanService.updateOne(undefined, { filter: { name: 'clan1' } });

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});