import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Action } from '../../../authorization/enum/action.enum';
import { RequestHelperService } from '../../../requestHelper/requestHelper.service';
import BoxBuilderFactory from '../../../__tests__/box/data/boxBuilderFactory';
import { boxRules } from '../../../authorization/rule/boxRules';
import { BoxDto } from '../../../box/dto/box.dto';

describe('boxRules() test suite', () => {
  const boxId = 'boxid';

  let requestHelperService: RequestHelperService;
  let getModelInstanceById: jest.Mock;

  const boxUserBuilder = BoxBuilderFactory.getBuilder('BoxUser');
  const boxAdminUser = boxUserBuilder.setGroupAdmin(true).build();

  beforeEach( async () => {
    getModelInstanceById = jest.fn();
    requestHelperService = {
      getModelInstanceById,
    } as any;
  });

  it('Should allow read action with matching adminProfile_id', async () => {
    getModelInstanceById.mockResolvedValueOnce({
      _id: boxId,
      adminProfile_id: boxAdminUser.profile_id,
    } as Partial<BoxDto>);

    const ability = await boxRules(
      boxAdminUser,
      BoxDto,
      Action.read,
      { _id: boxId } as any,
      requestHelperService
    );

    expect(ability.can(Action.read_request, BoxDto)).toBe(true);
    expect(getModelInstanceById).toHaveBeenCalled();
  });

  it('Should throw NotFoundException if the room does not exist', async () => {
    getModelInstanceById.mockResolvedValueOnce(null);
    
    await expect(
      boxRules(
        boxAdminUser,
      BoxDto,
      Action.read,
      { _id: boxId } as any,
      requestHelperService
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('Should throw ForbiddenException if Admin does not own the Box', async () => {
    getModelInstanceById.mockResolvedValueOnce({
      _id: boxId,
      adminProfile_id: 'nonExisting',
    } as Partial<BoxDto>);

    await expect(
      boxRules(
        boxAdminUser,
        BoxDto,
        Action.read,
        { _id: boxId } as any,
        requestHelperService
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
