import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import RoomModule from '../../modules/room.module';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { RoomService } from '../../../../clanInventory/room/room.service';

describe('Room.activateRoomsByIds() test suite', () => {
  let roomService: RoomService;
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();

  const soulHome_id = getNonExisting_id();
  const existingRoom1 = roomBuilder.setSoulHomeId(soulHome_id).build();
  const existingRoom2 = roomBuilder.setSoulHomeId(soulHome_id).build();

  beforeEach(async () => {
    roomService = await RoomModule.getRoomService();

    const createdRoom1 = await roomModel.create(existingRoom1);
    existingRoom1._id = createdRoom1._id;

    const createdRoom2 = await roomModel.create(existingRoom2);
    existingRoom2._id = createdRoom2._id;
  });

  it('Should not throw if some of the rooms does not exists', async () => {
    const activateCall = async () =>
      await roomService.activateRoomsByIds(
        [getNonExisting_id(), existingRoom2._id],
        1000,
      );

    expect(activateCall).not.toThrow();
  });

  //TODO: should not throw
  it('Should throw if room _ids are null or undefined', async () => {
    const nullInput = async () =>
      await roomService.activateRoomsByIds(null, 1000);
    const undefinedInput = async () =>
      await roomService.activateRoomsByIds(undefined, 1000);

    await expect(nullInput).rejects.toThrow();
    await expect(undefinedInput).rejects.toThrow();
  });
});
