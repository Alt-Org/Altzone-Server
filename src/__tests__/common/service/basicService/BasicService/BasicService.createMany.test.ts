import BasicService from "../../../../../common/service/basicService/BasicService";
import Factory from "../../../../clan_module/data/factory";
import ClanModule from "../../../../clan_module/modules/clan.module";


describe('BasicService.createMany() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = Factory.getBuilder('CreateClanDto');

    const clan1 = clanCreateBuilder.setName('clan1').build();
    const clan2 = clanCreateBuilder.setName('clan2').build();

    it('Should save data to DB if it is valid', async () => {
        await basicService.createMany([clan1, clan2]);

        const clan1DBResp = (await clanModel.findOne({ name: clan1.name })).toObject();
        const clan2DBResp = (await clanModel.findOne({ name: clan2.name })).toObject();

        expect(clan1DBResp).not.toBeUndefined();
        expect(clan2DBResp).not.toBeUndefined();
        expect(clan1DBResp).toEqual(expect.objectContaining({...clan1}));
        expect(clan2DBResp).toEqual(expect.objectContaining({...clan2}));
    });

    it('Should return saved data in DB, if it is valid', async () => {
        const [result, errors] = await basicService.createMany([clan1, clan2]);

        expect(errors).toBeNull();
        expect(result).toEqual(expect.arrayContaining([expect.objectContaining(clan1), expect.objectContaining(clan2)]));
    });

    it('Should not save any data, if the provided input not valid', async () => {
        const invalidClans = [{...clan1, labels: [ 'not_enum_value' ]}];
        await basicService.createMany(invalidClans);

        const dbResp = await clanModel.find();

        expect(dbResp).toHaveLength(0);
    });

    it('Should return ServiceError with reason WRONG_ENUM, if the provided input not valid', async () => {
        const invalidClans = [{...clan1, labels: [ 'not_enum_value' ]}];
        const [result, errors] = await basicService.createMany(invalidClans);

        expect(result).toBeNull();
        expect(errors).toContainSE_WRONG_ENUM();
    });

    it('Should not throw any error if provided input is null or undefined', async () => {
        const nullInput = async () => await basicService.createMany(null);
        const undefinedInput = async () => await basicService.createMany(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});