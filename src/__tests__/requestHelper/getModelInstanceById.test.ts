import { ModelName } from '../../common/enum/modelName.enum';
import { RequestHelperService } from '../../requestHelper/requestHelper.service';

describe('RequestHelperService.getModelInstanceById()', () => {
  class TestDto {
    _id: string;
  }

  const validId = '507f1f77bcf86cd799439011';
  let connection: { model: jest.Mock };
  let findById: jest.Mock;
  let lean: jest.Mock;
  let service: RequestHelperService;

  beforeEach(() => {
    lean = jest.fn();
    findById = jest.fn().mockReturnValue({ lean });
    connection = {
      model: jest.fn().mockReturnValue({ findById }),
    };
    service = new RequestHelperService(connection as any);
  });

  it.each(['12345', 'invalidid'])(
    'does not query MongoDB for malformed ID %s',
    async (invalidId) => {
      await expect(
        service.getModelInstanceById(ModelName.CLAN, invalidId, TestDto),
      ).resolves.toBeNull();

      expect(connection.model).not.toHaveBeenCalled();
      expect(findById).not.toHaveBeenCalled();
    },
  );

  it('queries MongoDB and returns null for a valid but missing ID', async () => {
    lean.mockResolvedValue(null);

    await expect(
      service.getModelInstanceById(ModelName.CLAN, validId, TestDto),
    ).resolves.toBeNull();

    expect(connection.model).toHaveBeenCalledWith(ModelName.CLAN);
    expect(findById).toHaveBeenCalledWith(validId);
  });
});
