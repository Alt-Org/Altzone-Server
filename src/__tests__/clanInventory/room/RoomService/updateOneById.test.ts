import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { RoomService } from '../../../../clanInventory/room/room.service';
import RoomModule from '../../modules/room.module';

describe('RoomService.updateOneById() test suite', () => {
  let roomService: RoomService;
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomUpdateBuilder =
    ClanInventoryBuilderFactory.getBuilder('UpdateRoomDto');
  const roomModel = RoomModule.getRoomModel();
  const existingRoom = roomBuilder.setSoulHomeId(getNonExisting_id()).build();

  beforeEach(async () => {
    roomService = await RoomModule.getRoomService();
    const createdRoom = await roomModel.create(existingRoom);
    existingRoom._id = createdRoom._id;
  });

  //TODO: Should not throw
  it('Should throw error if input is null or undefined', async () => {
    const nullInput = async () => await roomService.updateOneById(null);
    const undefinedInput = async () =>
      await roomService.updateOneById(undefined);

    await expect(nullInput).rejects.toThrow();
    await expect(undefinedInput).rejects.toThrow();
  });
});
