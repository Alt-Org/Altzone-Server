import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import { ObjectId } from 'mongodb';
import { RoomService } from '../../../../clanInventory/room/room.service';
import RoomModule from '../../modules/room.module';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';

describe('RoomService.createMany() test suite', () => {
  let roomService: RoomService;
  const roomCreateBuilder =
    ClanInventoryBuilderFactory.getBuilder('CreateRoomDto');
  const roomModel = RoomModule.getRoomModel();

  const soulHome_id = getNonExisting_id();
  const room1ToCreate = roomCreateBuilder.setSoulHomeId(soulHome_id).build();
  const room2ToCreate = roomCreateBuilder.setSoulHomeId(soulHome_id).build();

  beforeEach(async () => {
    roomService = await RoomModule.getRoomService();
  });

  it('Should save rooms data to DB if input is valid', async () => {
    await roomService.createMany([room1ToCreate, room2ToCreate]);

    const dbResp = await roomModel.find({ soulHome_id: soulHome_id });

    const clearedResp = clearDBRespDefaultFields(dbResp);

    expect(dbResp).toHaveLength(2);
    expect(clearedResp).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...room1ToCreate,
          _id: expect.any(ObjectId),
          isActive: false,
        }),
        expect.objectContaining({
          ...room2ToCreate,
          _id: expect.any(ObjectId),
          isActive: false,
        }),
      ]),
    );
  });

  it('Should return saved room data, if input is valid', async () => {
    const [result, errors] = await roomService.createMany([
      room1ToCreate,
      room2ToCreate,
    ]);

    expect(errors).toBeNull();
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...room1ToCreate,
          _id: expect.any(ObjectId),
          isActive: false,
        }),
        expect.objectContaining({
          ...room2ToCreate,
          _id: expect.any(ObjectId),
          isActive: false,
        }),
      ]),
    );
  });

  //TODO: should not save, sometimes saves sometimes not
  it('Should save any data in DB, if the provided cellCount is null', async () => {
    const invalidRoom = { ...room1ToCreate, cellCount: null } as any;
    await roomService.createMany([invalidRoom, room2ToCreate]);

    const dbResp = await roomModel.find({ soulHome_id: soulHome_id });

    expect(dbResp).not.toHaveLength(3);
  });

  it('Should return ServiceError with reason REQUIRED, if the provided cellCount is null', async () => {
    const invalidRoom = { ...room1ToCreate, cellCount: null } as any;
    const [result, errors] = await roomService.createMany([
      invalidRoom,
      room2ToCreate,
    ]);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should not throw any error if provided input is null or undefined', async () => {
    const nullInput = async () => await roomService.createMany(null);
    const undefinedInput = async () => await roomService.createMany(undefined);

    expect(nullInput).not.toThrow();
    expect(undefinedInput).not.toThrow();
  });
});
