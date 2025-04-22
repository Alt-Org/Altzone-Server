import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { BoxService } from '../../../box/box.service';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import { ObjectId } from 'mongodb';
import BoxModule from '../modules/box.module';

describe('BoxService.updateOneById() test suite', () => {
  let boxService: BoxService;
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const boxModel = BoxModule.getBoxModel();
  const existingBox = boxBuilder
    .setAdminPassword('password')
    .setAdminPlayerId(new ObjectId())
    .setAdminProfileId(new ObjectId())
    .setChatId(new ObjectId())
    .build();

  beforeEach(async () => {
    boxService = await BoxModule.getBoxService();
    const createdBox = await boxModel.create(existingBox);
    existingBox._id = createdBox._id;
  });

  it('Should update box in the DB and return true if the input is valid', async () => {
    const updatedChatId = new ObjectId();
    const updateData = boxBuilder
      .setId(existingBox._id)
      .setChatId(updatedChatId)
      .build();

    const [wasUpdated, errors] = await boxService.updateOneById(updateData);

    expect(errors).toBeNull();
    expect(wasUpdated).toBeTruthy();

    const updatedBox = await boxModel.findById(existingBox._id);
    expect(updatedBox.chat_id).toEqual(updatedChatId);
  });

  it('Should return ServiceError REQUIRED if _id is not provided', async () => {
    const updatedChatId = new ObjectId();
    const updateData = boxBuilder.setId(null).setChatId(updatedChatId).build();

    const [wasUpdated, errors] = await boxService.updateOneById(updateData);

    expect(wasUpdated).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('_id');
  });

  it('Should return ServiceError NOT_FOUND if the box with provided _id does not exist', async () => {
    const updatedChatId = new ObjectId();
    const updateData = boxBuilder
      .setId(new ObjectId(getNonExisting_id()))
      .setChatId(updatedChatId)
      .build();

    const [wasUpdated, errors] = await boxService.updateOneById(updateData);

    expect(wasUpdated).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].field).toBe('_id');
  });

  it('Should return ServiceError NOT_UNIQUE if the box with provided _id adminPassword already exists', async () => {
    const otherBox = boxBuilder
      .setAdminPassword('other-box-password')
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .setChatId(new ObjectId())
      .build();
    await boxModel.create(otherBox);

    const updateData = boxBuilder
      .setId(existingBox._id)
      .setAdminPassword(otherBox.adminPassword)
      .build();

    const [wasUpdated, errors] = await boxService.updateOneById(updateData);

    expect(wasUpdated).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
    expect(errors[0].field).toBe('adminPassword');
    expect(errors[0].value).toBeNull();
  });
});
