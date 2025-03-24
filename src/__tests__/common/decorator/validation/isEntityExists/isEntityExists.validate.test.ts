import { Model } from 'mongoose';
import { isEntityExists } from '../../../../../common/decorator/validation/isEntityExists';
import { ModelName } from '../../../../../common/enum/modelName.enum';
import { Clan } from '../../../../../clan/clan.schema';
import ClanModule from '../../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../../clan/data/clanBuilderFactory';

describe('isEntityExists.validate() test suite', () => {
  let model: Model<Clan>;
  let sut: isEntityExists<Clan>;

  beforeEach(async () => {
    model = ClanModule.getClanModel();
    sut = new isEntityExists(ModelName.CLAN, '_id', model);
  });

  it('Should throw error if model is not defined in the class', async () => {
    sut = new isEntityExists(ModelName.CLAN, '_id');

    const throwingError = async function () {
      await sut.validate('667ee778b3b5bf0f7a840ec9');
    };

    await expect(throwingError).rejects.toThrow(
      new Error(
        'isEntityExists class validate(): Can not validate entity existing. Model for DB query is not provided. ' +
          'Please provide the model for Clan via constructor or setEntityModel(), ' +
          'before using the isEntityExists class',
      ),
    );
  });

  it('Should return false if no items with this _id found', async () => {
    const isFound = await sut.validate('667ee778b3b5bf0f7a840ec9');
    expect(isFound).toBeFalsy();
  });

  it('Should return true if item with this _id found', async () => {
    const clanBuilder = ClanBuilderFactory.getBuilder('CreateClanDto');
    const existingClan = await model.create(clanBuilder.build());
    const existingClan_id = existingClan._id.toString();

    const isFound = await sut.validate(existingClan_id);
    expect(isFound).toBeTruthy();
  });
});
