import {SoulHomeService} from "../../../../clanInventory/soulhome/soulhome.service";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import SoulhomeModule from "../../modules/soulhome.module";
import ClanModule from "../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../clan/data/clanBuilderFactory";
import ServiceError from "../../../../common/service/basicService/ServiceError";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ObjectId} from "mongodb";

describe('SoulHomeService.createOne() test suite', () => {
    let soulHomeService: SoulHomeService;
    const soulHomeCreateBuilder = ClanInventoryBuilderFactory.getBuilder('CreateSoulHomeDto');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();

    const clanModel = ClanModule.getClanModel();
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const existingClan = clanBuilder.build();

    const soulHomeName = 'soulhome1';
    const soulHomeToCreate = soulHomeCreateBuilder.setName(soulHomeName).build();

    beforeEach(async () => {
        const createdClan = await clanModel.create(existingClan);
        existingClan._id = createdClan._id.toString();

        soulHomeService = await SoulhomeModule.getSoulHomeService();
        soulHomeToCreate.clan_id = existingClan._id;
    });

    it('Should save soul home data to DB if input is valid', async () => {
        await soulHomeService.createOne(soulHomeToCreate);

        const dbResp = await soulHomeModel.find({ name: soulHomeToCreate.name });
        const clanInDB = dbResp[0]?.toObject();

        const clearedResp = clearDBRespDefaultFields(clanInDB);

        expect(dbResp).toHaveLength(1);
        expect(clearedResp).toEqual(expect.objectContaining({...soulHomeToCreate, _id: expect.any(ObjectId)}));
    });

    it('Should return saved soul home data, if input is valid', async () => {
        const [result,] = await soulHomeService.createOne(soulHomeToCreate);

        expect(result).not.toBeInstanceOf(ServiceError);
        expect(result).toEqual(expect.objectContaining({...soulHomeToCreate, _id: expect.any(ObjectId)}));
    });

    it('Should not save any data in DB, if the provided name is null', async () => {
        const invalidSoulHome = {...soulHomeToCreate, name: null} as any;
        await soulHomeService.createOne(invalidSoulHome);

        const dbResp = await soulHomeModel.findOne({ name: invalidSoulHome.name });

        expect(dbResp).toBeNull();
    });

    it('Should return ServiceError with reason REQUIRED, if the provided name is null', async () => {
        const invalidSoulHome = {...soulHomeToCreate, name: null} as any;
        const [result, errors] = await soulHomeService.createOne(invalidSoulHome);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should not throw any error if provided input is null or undefined', async () => {
        const nullInput = async () => await soulHomeService.createOne(null);
        const undefinedInput = async () => await soulHomeService.createOne(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});