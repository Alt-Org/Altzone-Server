import BoxAuthHandler from '../../../../box/auth/BoxAuthHandler';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import BoxModule from '../../modules/box.module';
import ProfileModule from '../../../profile/modules/profile.module';
import ProfileBuilderFactory from '../../../profile/data/profileBuilderFactory';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { Box } from '../../../../box/schemas/box.schema';
import { ObjectId } from 'mongodb';
import { BoxUser } from '../../../../box/auth/BoxUser';

describe('BoxAuthHandler.isGroupAdmin() test suite', () => {
  let boxAuthHandler: BoxAuthHandler;
  const boxUserBuilder = BoxBuilderFactory.getBuilder('BoxUser');
  let boxAdminUser: BoxUser;

  const groupAdminModel = BoxModule.getGroupAdminModel();
  const adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
  const existingAdmin = adminBuilder.build();

  const boxModel = BoxModule.getBoxModel();
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  let existingBox: Box;

  const profileModel = ProfileModule.getProfileModel();
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const existingProfile = profileBuilder.build();

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const existingPlayer = playerBuilder.build();

  beforeEach(async () => {
    boxAuthHandler = await BoxModule.getBoxAuthHandler();

    const adminResp = await groupAdminModel.create(existingAdmin);
    existingAdmin._id = adminResp._id;

    const profileResp = await profileModel.create(existingProfile);
    existingProfile._id = profileResp._id;

    existingPlayer.profile_id = existingProfile._id;
    const playerResp = await playerModel.create(existingPlayer);
    existingPlayer._id = playerResp._id;

    existingBox = boxBuilder
      .setAdminPassword(existingAdmin.password)
      .setAdminPlayerId(new ObjectId(existingPlayer._id))
      .setAdminProfileId(new ObjectId(existingProfile._id))
      .setChatId(new ObjectId())
      .build();
    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;

    boxAdminUser = boxUserBuilder
      .setBoxId(existingBox._id.toString())
      .setPlayerId(existingPlayer._id.toString())
      .setProfileId(existingProfile._id.toString())
      .setGroupAdmin(true)
      .build();
  });

  it('Should return true if the user is group admin and the admin password is still valid', async () => {
    const [isAdmin, errors] = await boxAuthHandler.isGroupAdmin(boxAdminUser);

    expect(errors).toBeNull();
    expect(isAdmin).toBeTruthy();
  });

  it('Should return false if the user is not group admin', async () => {
    const nonAdmin = boxUserBuilder.setGroupAdmin(false).build();
    const [isAdmin, errors] = await boxAuthHandler.isGroupAdmin(nonAdmin);

    expect(errors).toBeNull();
    expect(isAdmin).toBeFalsy();
  });

  it('Should return NOT_FOUND ServiceError if the user group admin, but the admin password is not valid', async () => {
    await groupAdminModel.findByIdAndUpdate(existingAdmin._id, {
      password: 'other-password',
    });

    const [isAdmin, errors] = await boxAuthHandler.isGroupAdmin(boxAdminUser);

    expect(isAdmin).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('GroupAdmin.password');
    expect(errors[0].value).toBeNull();
  });

  it('Should return NOT_FOUND ServiceError if the user group admin, but the admin password is null', async () => {
    await boxModel.findByIdAndUpdate(existingBox._id, { adminPassword: null });

    const [isAdmin, errors] = await boxAuthHandler.isGroupAdmin(boxAdminUser);

    expect(isAdmin).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('GroupAdmin.password');
    expect(errors[0].value).toBeNull();
  });

  it('Should return NOT_FOUND ServiceError if any box is not found for the user', async () => {
    await boxModel.findByIdAndDelete(existingBox._id);

    const [isAdmin, errors] = await boxAuthHandler.isGroupAdmin(boxAdminUser);

    expect(isAdmin).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('BoxUser.box_id');
  });
});
