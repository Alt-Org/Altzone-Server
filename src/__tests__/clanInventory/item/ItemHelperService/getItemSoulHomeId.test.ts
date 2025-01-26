import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import ItemModule from "../../modules/item.module";
import {ItemHelperService} from "../../../../clanInventory/item/itemHelper.service";
import SoulhomeModule from "../../modules/soulhome.module";
import RoomModule from "../../modules/room.module";

describe('ItemHelperService.getItemSoulHomeId() test suite', () => {
    let itemHelperService: ItemHelperService;
    const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
    const itemModel = ItemModule.getItemModel();
    const existingItem = itemBuilder.build();

    const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    const soulHomeModel = SoulhomeModule.getSoulhomeModel();
    const existingSoulHome = soulHomeBuilder.setClanId(getNonExisting_id()).build();

    const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    const roomModel = RoomModule.getRoomModel();
    const existingRoom = roomBuilder.build();

    beforeEach(async () => {
        itemHelperService = await ItemModule.getItemHelperService();

        const createdSoulHome = await soulHomeModel.create(existingSoulHome);
        existingSoulHome._id = createdSoulHome._id;

        existingRoom.soulHome_id = existingSoulHome._id;
        const createdRoom = await roomModel.create(existingRoom);
        existingRoom._id = createdRoom._id;

        existingItem.room_id = existingRoom._id as any;
        const createdItem = await itemModel.create(existingItem);
        existingItem._id = createdItem._id;
    });

    it('Should find soul home _id for the item in soul home room', async () => {
        const soulHome_id = await itemHelperService.getItemSoulHomeId(existingItem._id);

        expect(soulHome_id).toBe(existingSoulHome._id.toString());
    });

    it('Should throw NOT_FOUND SE if item is not in any soul home room', async () => {
        const throwNotFound = async () => await itemHelperService.getItemSoulHomeId(existingItem._id);

        expect(throwNotFound).rejects.toContainSE_NOT_FOUND();
    });

    it('Should throw NOT_FOUND SE if item with provided item does not exists', async () => {
        const throwNotFound = async () => await itemHelperService.getItemSoulHomeId(getNonExisting_id());

        expect(throwNotFound).rejects.toContainSE_NOT_FOUND();
    });

    //TODO: should return VALIDATION not NOT_FOUND
    it('Should throw NOT_FOUND SE if provided _id param is not a mongo id', async () => {
        const throwNotFound = async () => await itemHelperService.getItemSoulHomeId('not-mongo-id');

        expect(throwNotFound).rejects.toContainSE_NOT_FOUND();
    });
});