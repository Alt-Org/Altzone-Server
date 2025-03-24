import { GroupAdminService } from '../../../../box/groupAdmin/groupAdmin.service';
import BoxModule from '../../modules/box.module';
import BoxBuilderFactory from '../../data/boxBuilderFactory';

describe('GroupAdminService.isRegisteredPassword() test suite', () => {
  let adminService: GroupAdminService;
  const adminModel = BoxModule.getGroupAdminModel();
  const adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');

  beforeEach(async () => {
    adminService = await BoxModule.getGroupAdminService();
  });

  it('Should return true if the password is registered', async () => {
    const existingPassword = 'password';
    const existingAdmin = adminBuilder.setPassword(existingPassword).build();
    await adminModel.create(existingAdmin);

    const [doesExists, errors] =
      await adminService.isRegisteredPassword(existingPassword);

    expect(errors).toBeNull();
    expect(doesExists).toBeTruthy();
  });

  it('Should return false if the password is not registered', async () => {
    const nonExistingPassword = 'non-existing-password';

    const [doesExists, errors] =
      await adminService.isRegisteredPassword(nonExistingPassword);

    expect(errors).toBeNull();
    expect(doesExists).toBeFalsy();
  });

  it('Should return REQUIRED SE if provided password is null', async () => {
    const [doesExists, errors] = await adminService.isRegisteredPassword(null);

    expect(doesExists).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return REQUIRED SE if provided password is undefined', async () => {
    const [doesExists, errors] =
      await adminService.isRegisteredPassword(undefined);

    expect(doesExists).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });
});
