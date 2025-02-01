import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {ItemService} from "../../../../clanInventory/item/item.service";
import ItemModule from "../../modules/item.module";
import {ItemName} from "../../../../clanInventory/item/enum/itemName.enum";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ObjectId} from "mongodb";


describe('ItemService.updateOneById() test suite', () => {
    let itemService: ItemService;
    const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
    const itemUpdateBuilder = ClanInventoryBuilderFactory.getBuilder('UpdateItemDto');
    const itemModel = ItemModule.getItemModel();
    const existingItem = itemBuilder.setRoomId(new ObjectId(getNonExisting_id())).setName(ItemName.CLOSET_RAKKAUS).build();

    beforeEach(async () => {
        itemService = await ItemModule.getItemService();
        const createdItem = await itemModel.create(existingItem);
        existingItem._id = createdItem._id;
    });

    it('Should update item in the DB and return true if the input is valid', async () => {
        const updatedLocation = [1,2];
        const updateData = itemUpdateBuilder.setId(existingItem._id).setLocation(updatedLocation).build();

        const [wasUpdated, errors] = await itemService.updateOneById(updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedItem = await itemModel.findById(existingItem._id);
        const clearedItem = clearDBRespDefaultFields(updatedItem);
        expect(clearedItem).toEqual({...existingItem, location: updatedLocation});
    });

    it('Should return ServiceError NOT_FOUND if the item with provided _id does not exist', async () => {
        const updatedLocation = [1,2];
        const updateData = itemUpdateBuilder.setId(getNonExisting_id()).setLocation(updatedLocation).build();

        const [wasUpdated, errors] = await itemService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    //TODO: Should not throw
    it('Should throw error if input is null or undefined', async () => {
        const nullInput = async () => await itemService.updateOneById(null);
        const undefinedInput = async () => await itemService.updateOneById(undefined);

        await expect(nullInput).rejects.toThrow();
        await expect(undefinedInput).rejects.toThrow();
    });
});