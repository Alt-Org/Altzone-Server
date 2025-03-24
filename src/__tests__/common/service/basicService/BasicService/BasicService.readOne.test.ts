import { ObjectId } from 'mongodb';
import BasicService from '../../../../../common/service/basicService/BasicService';
import { ModelName } from '../../../../../common/enum/modelName.enum';
import ClanModule from '../../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../../clan/data/clanBuilderFactory';

describe('BasicService.readOne() test suite', () => {
  const clanModel = ClanModule.getClanModel();
  const basicService = new BasicService(clanModel);
  const clanCreateBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');

  const existingClanName = 'clan1';
  const existingClan = clanCreateBuilder.setName(existingClanName).build();
  let existingClan_id: string;

  beforeEach(async () => {
    const dbResp = await clanModel.create(existingClan);
    existingClan_id = dbResp._id.toString();
  });

  it('Should find and return an object based on the provided filter', async () => {
    const filter = { name: existingClanName };

    const [result, errors] = await basicService.readOne({ filter });

    expect(errors).toBeNull();
    expect(result).toEqual(
      expect.objectContaining({
        ...existingClan,
        _id: new ObjectId(existingClan_id),
      }),
    );
  });

  it('Should return ServiceError NOT_FOUND if no object matches the provided filter', async () => {
    const filter = { name: 'non-existing-clan' };

    const [result, errors] = await basicService.readOne({ filter });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return only specified fields in options.select array except for _id and id', async () => {
    const filter = { name: existingClanName };
    const expected = { goal: existingClan.goal, name: existingClan.name };

    const [result, errors] = await basicService.readOne({
      filter,
      select: ['goal', 'name'],
    });
    const { _id, id: __id, ...resultWithoutIds } = result.toObject();

    expect(errors).toBeNull();
    expect(resultWithoutIds).toEqual(expected);
  });

  it('Should return object with reference objects specified in options.includeRefs array', async () => {
    const filter = { name: existingClanName };
    const expected = { ...existingClan, Player: [] };

    const [result, errors] = await basicService.readOne({
      filter,
      includeRefs: [ModelName.PLAYER],
    });

    expect(errors).toBeNull();
    expect(result).toEqual(expect.objectContaining(expected));
  });

  it('Should return object with both fields from options.select and reference objects from options.includeRefs', async () => {
    const filter = { name: existingClanName };
    const expected = {
      goal: existingClan.goal,
      name: existingClan.name,
      Player: [],
    };

    const [result, errors] = await basicService.readOne({
      filter,
      select: ['goal', 'name'],
      includeRefs: [ModelName.PLAYER],
    });
    const { _id, id: __id, ...resultWithoutIds } = result.toObject();

    expect(errors).toBeNull();
    expect(resultWithoutIds).toEqual(expected);
  });

  it('Should not throw any error if provided input is null or undefined', async () => {
    const nullInput = async () => await basicService.readOne(null);
    const undefinedInput = async () => await basicService.readOne(undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
