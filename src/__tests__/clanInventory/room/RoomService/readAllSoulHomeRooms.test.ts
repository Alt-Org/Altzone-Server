import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import SoulhomeModule from '../../modules/soulhome.module';
import RoomModule from '../../modules/room.module';
import { clearDBRespDefaultFields } from '../../../test_utils/util/removeDBDefaultFields';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { RoomService } from '../../../../clanInventory/room/room.service';

describe('Room.readAllSoulHomeRooms() test suite', () => {
  let roomService: RoomService;
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();
  const existingRoom1 = roomBuilder.build();
  const existingRoom2 = roomBuilder.build();

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const existingSoulHome = soulHomeBuilder
    .setClanId(getNonExisting_id())
    .build();

  beforeEach(async () => {
    const createdSoulHome = await soulHomeModel.create(existingSoulHome);
    existingSoulHome._id = createdSoulHome._id;

    roomService = await RoomModule.getRoomService();
    existingRoom1.soulHome_id = existingSoulHome._id.toString();
    const createdRoom1 = await roomModel.create(existingRoom1);
    existingRoom1._id = createdRoom1._id;
    existingRoom2.soulHome_id = existingSoulHome._id.toString();
    const createdRoom2 = await roomModel.create(existingRoom2);
    existingRoom2._id = createdRoom2._id;
  });

  it('Should return all rooms of the soul home from DB', async () => {
    const [room, errors] = await roomService.readAllSoulHomeRooms(
      existingSoulHome._id,
    );

    const clearedRoom = clearDBRespDefaultFields(room);

    expect(errors).toBeNull();
    expect(clearedRoom).toEqual(
      expect.objectContaining([existingRoom1, existingRoom2]),
    );
  });

  it('Should return NOT_FOUND if soul home does not exists', async () => {
    const [room, errors] =
      await roomService.readAllSoulHomeRooms(getNonExisting_id());

    expect(room).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
