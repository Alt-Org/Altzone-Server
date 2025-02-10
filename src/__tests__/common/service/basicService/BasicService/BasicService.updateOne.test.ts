import BasicService from "../../../../../common/service/basicService/BasicService";
import Factory from "../../../../clan_module/data/factory";
import ClanModule from "../../../../clan_module/modules/clan.module";


describe('BasicService.updateOne() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = Factory.getBuilder('CreateClanDto');

    const existingClan = clanCreateBuilder.setName('clan1').build();
    let existingClan_id: string;

    beforeEach(async () => {
        const dbResp1 = await clanModel.create(existingClan);
        existingClan_id = dbResp1._id.toString();
    });

    it('Should update the object that matches the provided filter and return true', async () => {
        const filter = { name: existingClan.name };
        const newName = 'updatedClan1';
        const updateData = { name: newName };

        const [wasUpdated, errors] = await basicService.updateOne(updateData, { filter });

        expect(errors).toBeNull();
        expect(wasUpdated).toBe(true);

        const updatedClan = await clanModel.findById(existingClan_id);
        expect(updatedClan).toHaveProperty('name', newName);
    });

    it('Should return ServiceError NOT_FOUND if no object matches the provided filter', async () => {
        const filter = { name: 'non-existing-clan' };
        const updateData = { name: 'updatedClan' };

        const [wasUpdated, errors] = await basicService.updateOne(updateData, { filter });

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if input is null or undefined', async () => {
        const nullInput = async () => await basicService.updateOne(null, { filter: { name: 'clan1' } });
        const undefinedInput = async () => await basicService.updateOne(undefined, { filter: { name: 'clan1' } });

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});