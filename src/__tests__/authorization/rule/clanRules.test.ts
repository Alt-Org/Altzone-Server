import { NotFoundException } from '@nestjs/common';
import { User } from '../../../auth/user';
import { Action } from '../../../authorization/enum/action.enum';
import { clanRules } from '../../../authorization/rule/clanRules';
import { UpdateClanDto } from '../../../clan/dto/updateClan.dto';
import { ClanDto } from '../../../clan/dto/clan.dto';
import { ModelName } from '../../../common/enum/modelName.enum';

describe('clanRules() update and delete lookups', () => {
  const playerId = '507f1f77bcf86cd799439011';
  const clanId = '507f1f77bcf86cd799439012';
  const user = new User('profile-id', playerId);
  let getModelInstanceById: jest.Mock;

  beforeEach(() => {
    getModelInstanceById = jest.fn();
  });

  it('uses RequestHelperService instead of querying Mongoose directly', async () => {
    getModelInstanceById.mockResolvedValue({
      _id: clanId,
      admin_ids: [playerId],
    });
    const connection = { model: jest.fn() };

    await clanRules(
      user,
      UpdateClanDto,
      Action.update,
      { _id: clanId } as any,
      { getModelInstanceById } as any,
      connection as any,
    );

    expect(getModelInstanceById).toHaveBeenCalledWith(
      ModelName.CLAN,
      clanId,
      ClanDto,
    );
    expect(connection.model).not.toHaveBeenCalled();
  });

  it('returns 404 when a valid clan ID does not exist', async () => {
    getModelInstanceById.mockResolvedValue(null);

    await expect(
      clanRules(
        user,
        UpdateClanDto,
        Action.update,
        { _id: clanId } as any,
        { getModelInstanceById } as any,
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
