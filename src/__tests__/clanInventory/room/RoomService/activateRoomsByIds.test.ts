import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import RoomModule from '../../modules/room.module';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { RoomService } from '../../../../clanInventory/room/room.service';
import ClanBuilderFactory from '../../../clan/data/clanBuilderFactory';
import ClanModule from '../../../clan/modules/clan.module';
import SoulhomeModule from '../../modules/soulhome.module';
import { RoomStatus } from '../../../../clanInventory/room/enum/roomStatus.enum';

describe('Room.activateRoomsByIds() test suite', () => {
  let roomService: RoomService;
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();
  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();

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

  it('Should notify activated rooms grouped by SoulHome', async () => {
    const roomActivatedSpy = jest
      .spyOn(roomService['roomNotifier'], 'roomActivated')
      .mockImplementation();
    const clan = clanBuilder.setId(getNonExisting_id()).build();
    const soulHome = soulHomeBuilder
      .setId(getNonExisting_id())
      .setClanId(clan._id)
      .build();
    const inactiveRoom = roomBuilder
      .setSoulHomeId(soulHome._id)
      .setRoomStatus(RoomStatus.INACTIVE)
      .build();

    await clanModel.create(clan);
    await soulHomeModel.create(soulHome);
    const createdRoom = await roomModel.create(inactiveRoom);

    await roomService.activateRoomsByIds([createdRoom._id.toString()], 1000);

    expect(roomActivatedSpy).toHaveBeenCalledWith({
      clan_id: clan._id.toString(),
      soulHome_id: soulHome._id.toString(),
      rooms: [
        {
          _id: createdRoom._id.toString(),
          roomPosition: inactiveRoom.roomPosition,
          roomStatus: RoomStatus.ACTIVE,
          deactivationTime: expect.any(Date),
        },
      ],
    });
  });
});
