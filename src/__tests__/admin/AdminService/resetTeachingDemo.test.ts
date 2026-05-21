import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Model } from 'mongoose';
import { AdminProfileDto } from '../../../admin/dto/AdminProfile.dto';
import { AdminService } from '../../../admin/admin.service';
import { Clan } from '../../../clan/clan.schema';
import { Environment } from '../../../common/enum/environment.enum';
import { Game } from '../../../gameData/game.schema';
import { Player } from '../../../player/schemas/player.schema';
import { Profile } from '../../../profile/profile.schema';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { SoulHome } from '../../../clanInventory/soulhome/soulhome.schema';
import { Stock } from '../../../clanInventory/stock/stock.schema';

describe('AdminService.resetTeachingDemo() test suite', () => {
  let adminService: AdminService;

  type MockModel<T> = {
    deleteMany?: jest.Mock<any>;
    findById?: jest.Mock<any>;
  };

  let clanModel: MockModel<Clan>;
  let profileModel: MockModel<Profile>;
  let playerModel: MockModel<Player>;
  let stockModel: MockModel<Stock>;
  let gameModel: MockModel<Game>;
  let soulHomeModel: MockModel<SoulHome>;

  const nonAdminProfile: AdminProfileDto = {
    _id: 'randomid01',
    username: 'normal-user',
    isSystemAdmin: false,
  };

  const adminProfile: AdminProfileDto = {
    _id: 'randomid02',
    username: 'admin-user',
    isSystemAdmin: true,
  };

  beforeEach(() => {
    clanModel = {
      deleteMany: jest.fn(),
    };

    profileModel = {
      findById: jest.fn(),
      deleteMany: jest.fn(),
    };

    playerModel = {
      deleteMany: jest.fn(),
    };

    stockModel = {
      deleteMany: jest.fn(),
    };

    gameModel = {
      deleteMany: jest.fn(),
    };

    adminService = new AdminService(
      clanModel as unknown as Model<Clan>,
      profileModel as unknown as Model<Profile>,
      playerModel as unknown as Model<Player>,
      stockModel as unknown as Model<Stock>,
      gameModel as unknown as Model<Game>,
      soulHomeModel as unknown as Model<SoulHome>,
    );
  });

  it('Should return NOT_FOUND error when profile does not exist', async () => {
    const profileId = 'non-existent-profile-id';
    profileModel.findById!.mockReturnValue({
      populate: () => Promise.resolve(null),
    });

    const response = await adminService.resetTeachingDemo(profileId);
    const [result, errors] = response || [];

    expect(result).toBeNull();
    expect(errors.some((e) => e.reason === SEReason.NOT_FOUND)).toBe(true);
    expect(clanModel.deleteMany).not.toHaveBeenCalled();
    expect(profileModel.findById).toHaveBeenCalledWith(profileId, undefined);
  });

  it('Should return NOT_AUTHORIZED error when profile is not a system admin', async () => {
    profileModel.findById!.mockReturnValue({
      populate: () => Promise.resolve(nonAdminProfile),
    });

    const response = await adminService.resetTeachingDemo(nonAdminProfile._id);
    const [result, errors] = response || [];

    expect(result).toBeNull();
    expect(errors.some((e) => e.reason === SEReason.NOT_AUTHORIZED)).toBe(true);
    expect(clanModel.deleteMany).not.toHaveBeenCalled();
  });

  it('Should delete all teaching demo data when profile is a system admin', async () => {
    profileModel.findById!.mockReturnValue({
      populate: () => Promise.resolve(adminProfile),
    });

    const result = await adminService.resetTeachingDemo(adminProfile._id);

    expect(result).toBeUndefined();
    expect(clanModel.deleteMany).toHaveBeenCalledWith({
      environment: Environment.TEACHING_DEMO,
    });
    expect(profileModel.deleteMany).toHaveBeenCalledWith({
      environment: Environment.TEACHING_DEMO,
    });
    expect(playerModel.deleteMany).toHaveBeenCalledWith({
      environment: Environment.TEACHING_DEMO,
    });
    expect(stockModel.deleteMany).toHaveBeenCalledWith({
      environment: Environment.TEACHING_DEMO,
    });
    expect(gameModel.deleteMany).toHaveBeenCalledWith({
      environment: Environment.TEACHING_DEMO,
    });
    expect(soulHomeModel.deleteMany).toHaveBeenCalledWith({
      environment: Environment.TEACHING_DEMO,
    });
  });
});
