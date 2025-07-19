import { GroupAdminService } from '../../../../box/groupAdmin/groupAdmin.service';
import BoxModule from '../../modules/box.module';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import CreateGroupAdminDtoBuilder from '../../data/groupAdmin/CreateGroupAdminDtoBuilder';

describe('GroupAdminService.createOne() test suite', () => {
  let adminService: GroupAdminService;
  const adminModel = BoxModule.getGroupAdminModel();
  let adminBuilder: CreateGroupAdminDtoBuilder;

  beforeEach(async () => {
    adminBuilder = BoxBuilderFactory.getBuilder('CreateGroupAdminDto');
    adminService = await BoxModule.getGroupAdminService();
  });

  it('Should create a new group admin in DB and return true', async () => {
    const admin = adminBuilder.build();

    const [isAdminCreated, errors] = await adminService.createOne(admin);

    const adminInDB = await adminModel.findOne({ password: admin.password });

    expect(adminInDB).not.toBeNull();
    expect(adminInDB.password).toBe(admin.password);
    expect(errors).toBeNull();
    expect(isAdminCreated).toBe(true);
  });

  it('Should not create a new group admin in DB if there are already an admin with same password', async () => {
    const existingAdmin = adminBuilder.setPassword('existing-psw').build();
    const admin = adminBuilder.setPassword(existingAdmin.password).build();

    await adminModel.create(existingAdmin);

    await adminService.createOne(admin);

    const adminsInDB = await adminModel.find({
      password: existingAdmin.password,
    });

    expect(adminsInDB).toHaveLength(1);
  });

  it('Should return SE NOT_UNIQUE if there are already an admin with same password', async () => {
    const existingAdmin = adminBuilder.setPassword('existing-psw').build();
    const admin = adminBuilder.setPassword(existingAdmin.password).build();

    await adminModel.create(existingAdmin);

    const [isAdminCreated, errors] = await adminService.createOne(admin);

    expect(isAdminCreated).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
  });

  it('Should return SE REQUIRED if provided input is null', async () => {
    const admin = null as any;

    const [isAdminCreated, errors] = await adminService.createOne(admin);

    expect(isAdminCreated).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return SE REQUIRED if provided input is undefined', async () => {
    const admin = undefined as any;

    const [isAdminCreated, errors] = await adminService.createOne(admin);

    expect(isAdminCreated).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return SE REQUIRED if provided password is undefined', async () => {
    const admin = adminBuilder.setPassword(undefined).build();

    const [isAdminCreated, errors] = await adminService.createOne(admin);

    expect(isAdminCreated).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should not create admin in DB if provided password is undefined', async () => {
    const admin = adminBuilder.setPassword(undefined).build();

    await adminService.createOne(admin);

    const adminsInDB = await adminModel.find({
      $or: [{ password: 'undefined' }, { password: undefined }],
    });

    expect(adminsInDB).toHaveLength(0);
  });

  it('Should return SE REQUIRED if provided password is null', async () => {
    const admin = adminBuilder.setPassword(null).build();

    const [isAdminCreated, errors] = await adminService.createOne(admin);

    expect(isAdminCreated).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should not create admin in DB if provided password is null', async () => {
    const admin = adminBuilder.setPassword(null).build();

    await adminService.createOne(admin);

    const adminsInDB = await adminModel.find({
      $or: [{ password: 'null' }, { password: null }],
    });

    expect(adminsInDB).toHaveLength(0);
  });

  it('Should return SE REQUIRED if provided password is empty string', async () => {
    const admin = adminBuilder.setPassword('').build();

    const [isAdminCreated, errors] = await adminService.createOne(admin);

    expect(isAdminCreated).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should not create admin in DB if provided password is empty string', async () => {
    const admin = adminBuilder.setPassword('').build();

    await adminService.createOne(admin);

    const adminsInDB = await adminModel.find({ password: '' });

    expect(adminsInDB).toHaveLength(0);
  });
});
