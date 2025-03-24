import { isEntityExists } from '../../../../../common/decorator/validation/isEntityExists';
import { ModelName } from '../../../../../common/enum/modelName.enum';
import { Clan } from '../../../../../clan/clan.schema';

describe('isEntityExists.defaultMessage() test suite', () => {
  let sut: isEntityExists<Clan>;

  beforeEach(async () => {
    sut = new isEntityExists(ModelName.CLAN, '_id');
  });

  it('Should return valid message', () => {
    const returnedMessage = sut.defaultMessage({} as any);

    expect(returnedMessage).toBe(`Clan with that _id does not exists`);
  });
});
