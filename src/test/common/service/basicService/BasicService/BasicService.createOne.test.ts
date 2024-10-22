import BasicService from "../../../../../common/service/basicService/BasicService";
import Factory from "../../../../clan_module/data/factory";
import ClanModule from "../../../../clan_module/modules/clan.module";


describe('BasicService.createOne() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = Factory.getBuilder('CreateClanDto');
    const clanToCreate = clanCreateBuilder.build();

    it('Should save data to DB if it is valid', async () => {
        await basicService.createOne(clanToCreate);

        const dbResp = await clanModel.find({ name: clanToCreate.name });
        const clanInDB = dbResp[0]?.toObject();

        expect(dbResp).toHaveLength(1);
        expect(clanInDB).not.toBeUndefined();
        expect(clanInDB).toEqual(expect.objectContaining({...clanToCreate}));
    });

    it('Should return saved data in DB, if it is valid', async () => {
        const [result, errors] = await basicService.createOne(clanToCreate);

        expect(errors).toBeNull();
        expect(result).toEqual(expect.objectContaining({...clanToCreate}));
    });

    it('Should not save any data, if the provided input not valid', async () => {
        const invalidClan = {...clanToCreate, labels: [ 'not_enum_value' ]};
        await basicService.createOne(invalidClan);

        const dbResp = await clanModel.findOne({ name: clanToCreate.name });

        expect(dbResp).toBeNull();
    });

    it('Should return ServiceError with reason WRONG_ENUM, if the provided input not valid', async () => {
        const invalidClan = {...clanToCreate, labels: [ 'not_enum_value' ]};
        const [result, errors] = await basicService.createOne(invalidClan);

        expect(result).toBeNull();
        expect(errors).toContainSE_WRONG_ENUM();
    });

    it('Should not throw any error if provided input is null or undefined', async () => {
        const nullInput = async () => await basicService.createOne(null);
        const undefinedInput = async () => await basicService.createOne(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});