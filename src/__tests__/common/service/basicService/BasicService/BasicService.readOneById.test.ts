import { ObjectId } from "mongodb";
import BasicService from "../../../../../common/service/basicService/BasicService";
import { ModelName } from "../../../../../common/enum/modelName.enum";
import ClanModule from "../../../../clan/modules/clan.module";
import ClanBuilderFactory from "../../../../clan/data/clanBuilderFactory";


describe('BasicService.readOneById() test suite', () => {
    const clanModel = ClanModule.getClanModel();
    const basicService = new BasicService(clanModel);
    const clanCreateBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');

    const exitingClan = clanCreateBuilder.setName('clan1').build();
    let existingClan_id: string;

    beforeEach(async () => {
        const dbResp =  await clanModel.create(exitingClan);
        existingClan_id = dbResp._id.toString();
    });

    it('Should find and return existing object from DB', async () => {
        const [result, errors] = await basicService.readOneById(existingClan_id);

        expect(errors).toBeNull();
        expect(result).toEqual(expect.objectContaining({...exitingClan, _id: new ObjectId(existingClan_id)}));
    });

    it('Should return ServiceError NOT_FOUND if object with provided _id does not exists', async () => {
        const [result, errors] = await basicService.readOneById('non-existing');

        expect(result).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return object with only specified fields in options.select array except for _id and id', async () => {
        const expected = { goal: exitingClan.goal, name: exitingClan.name };

        const [result, errors] = await basicService.readOneById(existingClan_id, { select: ['goal', 'name'] });
        const { _id, id: __id, ...resultWithoutIds } = result.toObject();

        expect(errors).toBeNull();
        expect(resultWithoutIds).toEqual(expected);
    });

    it('Should return object with reference objects specified in options.includeRefs array', async () => {
        const expected = { ...exitingClan, Player: [] };

        const [result, errors] = await basicService.readOneById(existingClan_id, { includeRefs: [ModelName.PLAYER] });

        expect(errors).toBeNull();
        expect(result).toEqual(expect.objectContaining(expected));
    });

    it('Should return object with only specified fields in options.select array and reference objects specified in options.includeRefs array', async () => {
        const expected = { goal: exitingClan.goal, name: exitingClan.name, Player: [] };

        const [result, errors] = await basicService.readOneById(existingClan_id, { select: ['goal', 'name'], includeRefs: [ModelName.PLAYER] });
        const { _id, id: __id, ...resultWithoutIds } = result.toObject();

        expect(errors).toBeNull();
        expect(resultWithoutIds).toEqual(expected);
    });

    it('Should not throw any error if provided input is null or undefined', async () => {
        const nullInput = async () => await basicService.readOneById(null);
        const undefinedInput = async () => await basicService.readOneById(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});