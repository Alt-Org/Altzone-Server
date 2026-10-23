import { RoomService } from '../../../../clanInventory/room/room.service';
import ClanInventoryBuilderFactory from '../../data/clanInventoryBuilderFactory';
import RoomModule from '../../modules/room.module';
import { getNonExisting_id } from '../../../../__tests__/test_utils/util/getNonExisting_id';
import { UpdateRoomDto } from '../../../../clanInventory/room/dto/updateRoom.dto';
import ClanBuilderFactory from '../../../../__tests__/clan/data/clanBuilderFactory';
import ClanModule from '../../../../__tests__/clan/modules/clan.module';
import SoulhomeModule from '../../modules/soulhome.module';
import StockModule from '../../modules/stock.module';
import ItemModule from '../../modules/item.module';
import { ItemService } from '../../../../clanInventory/item/item.service';
import { UpdateItemDto } from '../../../../clanInventory/item/dto/updateItem.dto';
import { ItemRotation } from '../../../../clanInventory/item/enum/itemRotation.enum';
import { ItemPosition } from '../../../../clanInventory/item/enum/itemPosition.enum';
import { ClanService } from '../../../../clan/clan.service';
import { ObjectId } from 'mongodb';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { ServerTaskName } from '../../../../dailyTasks/enum/serverTaskName.enum';

describe('Room.updateSoulHomeRooms() test suite', () => {
  let roomService: RoomService;
  let itemService: ItemService;
  let clanService: ClanService;

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clanModel = ClanModule.getClanModel();
  const existingClan = clanBuilder.setId(getNonExisting_id()).build();

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const existingSoulHome = soulHomeBuilder
    .setId(getNonExisting_id())
    .setClanId(existingClan._id)
    .build();

  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const roomModel = RoomModule.getRoomModel();
  const existingRoom = roomBuilder
    .setId(getNonExisting_id())
    .setSoulHomeId(existingSoulHome._id)
    .build();

  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const stockModel = StockModule.getStockModel();
  const existingStock = stockBuilder
    .setId(getNonExisting_id())
    .setClanId(existingClan._id)
    .build();

  const itemBuilder = ClanInventoryBuilderFactory.getBuilder('CreateItemDto');
  const itemModel = ItemModule.getItemModel();
  const existingItem = itemBuilder.setStockId(existingStock._id).build();

  const update: UpdateRoomDto = {
    _id: existingRoom._id,
    roomColour: 'blue',
    floorType: 'wood',
    wallpaper: 'default',
    furniture: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    roomService = await RoomModule.getRoomService();
    itemService = await ItemModule.getItemService();
    clanService = await ClanModule.getClanService();

    await clanModel.create(existingClan);
    await soulHomeModel.create(existingSoulHome);
    await roomModel.create(existingRoom);
    await stockModel.create(existingStock);
    await itemModel.create(existingItem);
  });

  it('Should update values of a Room successfully', async () => {
    const [result, error] = await roomService.updateSoulHomeRooms(update);

    expect(result).toBeTruthy();
    expect(error).toBeNull();

    const [room, roomErrors] = await roomService.readOneById(existingRoom._id);

    expect(roomErrors).toBeNull();
    expect(room.roomColour).toEqual(update.roomColour);
    expect(room.floorType).toEqual(update.floorType);
  });

  it('Should update Room values successfully when furniture is omitted from the payload', async () => {
    const [item] = await itemService.createOne(existingItem);
    await itemModel.updateOne(
      { _id: item._id },
      { $set: { room_id: existingRoom._id } },
    );

    const updateWithoutFurniture: UpdateRoomDto = {
      _id: existingRoom._id,
      roomColour: 'red',
      floorType: 'stone',
      wallpaper: 'painted',
    };

    const [result, error] = await roomService.updateSoulHomeRooms(
      updateWithoutFurniture,
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();

    const [room, roomErrors] = await roomService.readOneById(existingRoom._id);

    expect(roomErrors).toBeNull();
    expect(room.roomColour).toEqual(updateWithoutFurniture.roomColour);
    expect(room.floorType).toEqual(updateWithoutFurniture.floorType);

    const [items, itemsErrors] = await itemService.readMany({
      filter: { _id: item._id },
    });
    expect(itemsErrors).toBeNull();
    expect(items[0].room_id.toString()).toBe(existingRoom._id.toString());
  });

  it('Should update Room furniture successfully and update value in Clan', async () => {
    const [item] = await itemService.createOne(existingItem);

    const itemUpdate: UpdateItemDto = {
      _id: item._id,
      location: [1, 1],
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null,
    };

    update.furniture = [itemUpdate];
    const [result, error] = await roomService.updateSoulHomeRooms(update);
    expect(result).toBeTruthy();
    expect(error).toBeNull();

    const [items, itemsErrors] = await itemService.readMany({
      filter: { room_id: existingRoom._id },
    });
    expect(itemsErrors).toBeNull();
    expect(items[0].room_id.toString()).toBe(existingRoom._id.toString());
    expect(items[0].stock_id).toBeNull();

    const [clan] = await clanService.readOneById(existingClan._id);
    expect(clan.furnitureTotalValue).toEqual(existingItem.price);
  });

  it('Should read final saved room items after a player saves furniture layout', async () => {
    const readManySpy = jest.spyOn(itemService, 'readMany');
    const [item] = await itemService.createOne(existingItem);

    const itemUpdate: UpdateItemDto = {
      _id: item._id,
      location: [1, 1],
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null,
    };

    update.furniture = [itemUpdate];
    const [result, error] = await roomService.updateSoulHomeRooms(
      update,
      'player-id',
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(readManySpy).toHaveBeenCalledWith({
      filter: { room_id: { $in: [existingRoom._id.toString()] } },
    });
  });

  it('Should use only furniture items from the final saved room state', () => {
    const furniture = {
      ...existingItem,
      _id: 'furniture-item',
      name: ItemName.SOFA_RAKKAUS,
      isFurniture: true,
    };
    const decoration = {
      ...existingItem,
      _id: 'decoration-item',
      name: ItemName.MIRROR_RAKKAUS,
      isFurniture: false,
    };

    const result = roomService['filterFurnitureItems']([
      furniture,
      decoration,
    ] as any);

    expect(result).toEqual([furniture]);
  });

  it('Should detect furniture set from item name using underscore separator', () => {
    expect(roomService['getFurnitureSetFromItemName']('Sofa_Taakka')).toBe(
      'Taakka',
    );
    expect(roomService['getFurnitureSetFromItemName']('Chair_Neuro')).toBe(
      'Neuro',
    );
    expect(roomService['getFurnitureSetFromItemName']('Bed_FearOfDeath')).toBe(
      'FearOfDeath',
    );
    expect(
      roomService['getFurnitureSetFromItemName']('Hologram_KylmaTulevaisuus'),
    ).toBe('KylmaTulevaisuus');
    expect(
      roomService['getFurnitureSetFromItemName']('InvalidName'),
    ).toBeNull();
  });

  it('Should emit BUILD_YOUR_WORLD when final saved room has at least three furniture items from the same set', async () => {
    const items = await Promise.all(
      [
        ItemName.SOFA_RAKKAUS,
        ItemName.ARMCHAIR_RAKKAUS,
        ItemName.CLOSET_RAKKAUS,
      ].map((name) =>
        itemService.createOne(
          ClanInventoryBuilderFactory.getBuilder('CreateItemDto')
            .setStockId(existingStock._id)
            .setName(name)
            .setIsFurniture(true)
            .build(),
        ),
      ),
    );

    const furniture = items.map(([item], index) => ({
      _id: item._id,
      location: [index, index],
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null,
    }));

    const [result, error] = await roomService.updateSoulHomeRooms(
      {
        _id: existingRoom._id,
        furniture,
      },
      'player-id',
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(
      roomService['eventEmitterService'].EmitNewDailyTaskEvent,
    ).toHaveBeenCalledWith('player-id', ServerTaskName.BUILD_YOUR_WORLD);
  });

  it('Should not emit BUILD_YOUR_WORLD when final saved room has fewer than three furniture items', async () => {
    const items = await Promise.all(
      [ItemName.SOFA_RAKKAUS, ItemName.ARMCHAIR_RAKKAUS].map((name) =>
        itemService.createOne(
          ClanInventoryBuilderFactory.getBuilder('CreateItemDto')
            .setStockId(existingStock._id)
            .setName(name)
            .setIsFurniture(true)
            .build(),
        ),
      ),
    );

    const furniture = items.map(([item], index) => ({
      _id: item._id,
      location: [index, index],
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null,
    }));

    const [result, error] = await roomService.updateSoulHomeRooms(
      {
        _id: existingRoom._id,
        furniture,
      },
      'player-id',
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(
      roomService['eventEmitterService'].EmitNewDailyTaskEvent,
    ).not.toHaveBeenCalled();
  });

  it('Should not emit BUILD_YOUR_WORLD when final saved room has mixed furniture sets', async () => {
    const items = await Promise.all(
      [
        ItemName.SOFA_RAKKAUS,
        ItemName.ARMCHAIR_RAKKAUS,
        ItemName.CLOSET_KIPU,
      ].map((name) =>
        itemService.createOne(
          ClanInventoryBuilderFactory.getBuilder('CreateItemDto')
            .setStockId(existingStock._id)
            .setName(name)
            .setIsFurniture(true)
            .build(),
        ),
      ),
    );

    const furniture = items.map(([item], index) => ({
      _id: item._id,
      location: [index, index],
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null,
    }));

    const [result, error] = await roomService.updateSoulHomeRooms(
      {
        _id: existingRoom._id,
        furniture,
      },
      'player-id',
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(
      roomService['eventEmitterService'].EmitNewDailyTaskEvent,
    ).not.toHaveBeenCalled();
  });

  it('Should not emit BUILD_YOUR_WORLD when furniture is omitted from the payload', async () => {
    const readFinalFurnitureSpy = jest.spyOn(
      roomService as any,
      'readFinalSavedRoomFurniture',
    );

    const [result, error] = await roomService.updateSoulHomeRooms(
      {
        _id: existingRoom._id,
        roomColour: 'purple',
      },
      'player-id',
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(readFinalFurnitureSpy).not.toHaveBeenCalled();
    expect(
      roomService['eventEmitterService'].EmitNewDailyTaskEvent,
    ).not.toHaveBeenCalled();
  });

  it('Should not emit BUILD_YOUR_WORLD when only non-furniture items match the same set', async () => {
    const items = await Promise.all(
      [
        ItemName.MIRROR_RAKKAUS,
        ItemName.CARPET_RAKKAUS,
        ItemName.CEILINGLAMP_RAKKAUS,
      ].map((name) =>
        itemService.createOne(
          ClanInventoryBuilderFactory.getBuilder('CreateItemDto')
            .setStockId(existingStock._id)
            .setName(name)
            .setIsFurniture(false)
            .build(),
        ),
      ),
    );

    const furniture = items.map(([item], index) => ({
      _id: item._id,
      location: [index, index],
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null,
    }));

    const [result, error] = await roomService.updateSoulHomeRooms(
      {
        _id: existingRoom._id,
        furniture,
      },
      'player-id',
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(
      roomService['eventEmitterService'].EmitNewDailyTaskEvent,
    ).not.toHaveBeenCalled();
  });

  it('Should validate BUILD_YOUR_WORLD against final room state instead of payload alone', async () => {
    const readFinalFurnitureSpy = jest
      .spyOn(roomService as any, 'readFinalSavedRoomFurniture')
      .mockResolvedValue([
        new Map([
          [
            existingRoom._id.toString(),
            [
              {
                ...existingItem,
                name: ItemName.SOFA_RAKKAUS,
                isFurniture: true,
              },
              {
                ...existingItem,
                name: ItemName.ARMCHAIR_RAKKAUS,
                isFurniture: true,
              },
              {
                ...existingItem,
                name: ItemName.CLOSET_KIPU,
                isFurniture: true,
              },
            ],
          ],
        ]),
        null,
      ]);
    const items = await Promise.all(
      [
        ItemName.SOFA_RAKKAUS,
        ItemName.ARMCHAIR_RAKKAUS,
        ItemName.CLOSET_RAKKAUS,
      ].map((name) =>
        itemService.createOne(
          ClanInventoryBuilderFactory.getBuilder('CreateItemDto')
            .setStockId(existingStock._id)
            .setName(name)
            .setIsFurniture(true)
            .build(),
        ),
      ),
    );

    const furniture = items.map(([item], index) => ({
      _id: item._id,
      location: [index, index],
      rotation: ItemRotation.FRONT,
      position: ItemPosition.FLOOR,
      placedOn_id: null,
      placedOnLocation: null,
    }));

    const [result, error] = await roomService.updateSoulHomeRooms(
      {
        _id: existingRoom._id,
        furniture,
      },
      'player-id',
    );

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(readFinalFurnitureSpy).toHaveBeenCalled();
    expect(
      roomService['eventEmitterService'].EmitNewDailyTaskEvent,
    ).not.toHaveBeenCalled();
  });

  it('Should return REQUIRED error if the room update has no fields to change', async () => {
    const emptyUpdate: UpdateRoomDto = {
      _id: existingRoom._id,
    };

    const [result, error] = await roomService.updateSoulHomeRooms(emptyUpdate);

    expect(result).toBeNull();
    expect(error).toContainSE_REQUIRED();

    const [room] = await roomService.readOneById(existingRoom._id);
    expect(room.roomColour).toEqual(existingRoom.roomColour);
  });

  it('Should return REQUIRED error if the room is null or undefined', async () => {
    const nullInput = async () => await roomService.updateSoulHomeRooms(null);
    const undefinedInput = async () =>
      await roomService.updateSoulHomeRooms(undefined);

    await expect(nullInput()).resolves.not.toThrow();
    await expect(undefinedInput()).resolves.not.toThrow();

    const [, nullErrors] = await roomService.updateSoulHomeRooms(null);
    expect(nullErrors).toContainSE_REQUIRED();
  });

  it('Should clear Room furniture when furniture is sent as an empty array with no other fields', async () => {
    const [item] = await itemService.createOne(existingItem);
    await itemModel.updateOne(
      { _id: item._id },
      { $set: { room_id: existingRoom._id } },
    );

    const clearFurnitureUpdate: UpdateRoomDto = {
      _id: existingRoom._id,
      furniture: [],
    };

    const [result, error] =
      await roomService.updateSoulHomeRooms(clearFurnitureUpdate);

    expect(result).toBeTruthy();
    expect(error).toBeNull();

    const [items, itemsErrors] = await itemService.readMany({
      filter: { _id: item._id },
    });
    expect(itemsErrors).toBeNull();
    expect(items[0].room_id).toBeNull();
    expect(items[0].stock_id.toString()).toBe(existingStock._id.toString());
  });

  it('Should notify a single layout update when one room is updated', async () => {
    const layoutUpdatedSpy = jest
      .spyOn(roomService['roomNotifier'], 'layoutUpdated')
      .mockImplementation();
    const singleUpdate: UpdateRoomDto = {
      _id: existingRoom._id,
      roomColour: 'green',
      floorType: 'tile',
      wallpaper: 'paper',
    };

    const [result, error] = await roomService.updateSoulHomeRooms(singleUpdate);

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(layoutUpdatedSpy).toHaveBeenCalledWith({
      clan_id: existingClan._id.toString(),
      soulHome_id: existingSoulHome._id.toString(),
      mode: 'single',
      rooms: [
        {
          _id: existingRoom._id.toString(),
          roomColour: singleUpdate.roomColour,
          wallpaper: singleUpdate.wallpaper,
          floorType: singleUpdate.floorType,
          furnitureChanged: false,
        },
      ],
    });
  });

  it('Should notify one batch layout update when multiple rooms are updated', async () => {
    const layoutUpdatedSpy = jest
      .spyOn(roomService['roomNotifier'], 'layoutUpdated')
      .mockImplementation();
    const secondRoom = {
      ...existingRoom,
      _id: new ObjectId().toString(),
      roomPosition: 2,
    };
    await roomModel.create(secondRoom);

    const batchUpdate: UpdateRoomDto[] = [
      {
        _id: existingRoom._id,
        roomColour: 'yellow',
      },
      {
        _id: secondRoom._id,
        floorType: 'stone',
        furniture: [],
      },
    ];

    const [result, error] = await roomService.updateSoulHomeRooms(batchUpdate);

    expect(result).toBeTruthy();
    expect(error).toBeNull();
    expect(layoutUpdatedSpy).toHaveBeenCalledTimes(1);
    expect(layoutUpdatedSpy).toHaveBeenCalledWith({
      clan_id: existingClan._id.toString(),
      soulHome_id: existingSoulHome._id.toString(),
      mode: 'batch',
      rooms: [
        {
          _id: existingRoom._id.toString(),
          roomColour: 'yellow',
          wallpaper: undefined,
          floorType: undefined,
          furnitureChanged: false,
        },
        {
          _id: secondRoom._id.toString(),
          roomColour: undefined,
          wallpaper: undefined,
          floorType: 'stone',
          furnitureChanged: true,
        },
      ],
    });
  });

  it('Should not notify a layout update when room update fails', async () => {
    const layoutUpdatedSpy = jest
      .spyOn(roomService['roomNotifier'], 'layoutUpdated')
      .mockImplementation();
    const emptyUpdate: UpdateRoomDto = {
      _id: existingRoom._id,
    };

    const [result, error] = await roomService.updateSoulHomeRooms(emptyUpdate);

    expect(result).toBeNull();
    expect(error).toContainSE_REQUIRED();
    expect(layoutUpdatedSpy).not.toHaveBeenCalled();
  });
});
