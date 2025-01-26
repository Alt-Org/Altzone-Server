import {SoulHomeService} from "../../../../clanInventory/soulhome/soulhome.service";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../modules/soulhome.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";


describe('SoulHomeService.updateOneById() test suite', () => {
    let soulHomeService: SoulHomeService;
    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeUpdateBuilder = ClanInventoryBuilderFactory.getBuilder('UpdateSoulHomeDto');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.setClanId('clan_id').build();

    beforeEach(async () => {
        soulHomeService = await SoulhomeModule.getSoulHomeService();

        const soulHomeResp = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = soulHomeResp._id;
    });

    it('Should update soul home in the DB and return true if the input is valid', async () => {
        const updatedName = 'updatedSoulHome';
        const updateData = soulHomeUpdateBuilder.setId(existingSoulHome._id).setName(updatedName).build();

        const [wasUpdated, errors] = await soulHomeService.updateOneById(updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedSoulHome = await soulHomeModel.findById(existingSoulHome._id);
        expect(updatedSoulHome.name).toBe(updatedName);
    });

    it('Should return ServiceError NOT_FOUND if the soul home with provided _id does not exist', async () => {
        const updatedName = 'updatedClan';
        const updateData = soulHomeUpdateBuilder.setId(getNonExisting_id()).setName(updatedName).build();

        const [wasUpdated, errors] = await soulHomeService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    //TODO: Should not throw
    it('Should throw error if input is null or undefined', async () => {
        const nullInput = async () => await soulHomeService.updateOneById(null);
        const undefinedInput = async () => await soulHomeService.updateOneById(undefined);

        await expect(nullInput).rejects.toThrow();
        await expect(undefinedInput).rejects.toThrow();
    });
});