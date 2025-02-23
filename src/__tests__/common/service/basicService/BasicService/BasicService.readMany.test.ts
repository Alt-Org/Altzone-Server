import BasicService from "../../../../../common/service/basicService/BasicService";
import { ModelName } from "../../../../../common/enum/modelName.enum";
import ClanModule from "../../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../../clan/data/clanBuilderFactory";


describe('BasicService.readMany() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');

    const clan1 = clanCreateBuilder.setName('clan1').build();
    const clan2 = clanCreateBuilder.setName('clan2').build();
    const clan3 = clanCreateBuilder.setName('clan3').build();

    const allClansFilter = { name: { $regex: 'clan' } };

    beforeEach(async () => {
        await clanModel.create(clan1);
        await clanModel.create(clan2);
        await clanModel.create(clan3);
    });

    it('Should return all objects that match the provided filter', async () => {
        const [result, errors] = await basicService.readMany({ filter: allClansFilter });

        expect(errors).toBeNull();
        expect(result).toHaveLength(3);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: clan1.name }),
                expect.objectContaining({ name: clan2.name }),
                expect.objectContaining({ name: clan3.name }),
            ])
        );
    });

    it('Should return only specified fields using options.select', async () => {
        const select = ['name'];

        const [result, errors] = await basicService.readMany({ filter: allClansFilter, select });

        expect(errors).toBeNull();
        expect(result).toHaveLength(3);
        result.forEach(clan => {
            expect(clan).toHaveProperty('name');
            expect(clan.goal).toBeUndefined();
        });
    });

    it('Should limit the number of returned objects using options.limit', async () => {
        const limit = 2;

        const [result, errors] = await basicService.readMany({ filter: allClansFilter, limit });

        expect(errors).toBeNull();
        expect(result).toHaveLength(2);
    });

    it('Should skip specified number of objects using options.skip', async () => {
        const skip = 1;

        const [result, errors] = await basicService.readMany({ filter: allClansFilter, skip });

        expect(errors).toBeNull();
        expect(result).toHaveLength(2);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: clan2.name }),
                expect.objectContaining({ name: clan3.name }),
            ])
        );
    });

    it('Should return sorted objects using options.sort', async () => {
        const sort: { ['name']: 1 } = { name: 1 };

        const [result, errors] = await basicService.readMany({ filter: allClansFilter, sort });

        expect(errors).toBeNull();
        expect(result.map(clan => clan.name)).toEqual([clan1.name, clan2.name, clan3.name]);
    });

    it('Should return objects with reference objects using options.includeRefs', async () => {

        const [result, errors] = await basicService.readMany({ filter: allClansFilter, includeRefs: [ModelName.PLAYER] });

        expect(errors).toBeNull();
        result.forEach(clan => {
            expect(clan).toHaveProperty('Player');
            expect(clan.Player).toEqual([]);
        });
    });

    it('Should return filtered, selected, sorted, limited, and skipped objects with reference objects when all options are used', async () => {
        const select = ['name'];
        const limit = 2;
        const skip = 1;
        const sort: { ['name']: -1 } = { name: -1 };

        const [result, errors] = await basicService.readMany({
            filter: allClansFilter,
            select,
            limit,
            skip,
            sort,
            includeRefs: [ModelName.PLAYER],
        });

        expect(errors).toBeNull();
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe(clan2.name);
        expect(result[1].name).toBe(clan1.name);
        result.forEach(clan => {
            expect(clan).toHaveProperty('Player');
            expect(clan.Player).toEqual([]);
        });
    });

    it('Should return ServiceError NOT_FOUND if no objects match the filter', async () => {
        const filter = { name: 'non-existing-clan' };

        const [result, errors] = await basicService.readMany({ filter });

        expect(result).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });
});