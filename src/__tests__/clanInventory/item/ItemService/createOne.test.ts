import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ObjectId} from "mongodb";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {ItemService} from "../../../../clanInventory/item/item.service";
import ItemModule from "../../modules/item.module";

describe('ItemService.createOne() test suite', () => {
    let itemService: ItemService;
    const itemCreateBuilder = ClanInventoryBuilderFactory.getBuilder('CreateItemDto');
    const itemModel = ItemModule.getItemModel();

    const room_id = new ObjectId(getNonExisting_id());
    const itemToCreate = itemCreateBuilder.setRoomId(room_id).build();

    beforeEach(async () => {
        itemService = await ItemModule.getItemService();
    });

    it('Should save item data to DB if input is valid', async () => {
        await itemService.createOne(itemToCreate);

        const dbResp = await itemModel.find({ room_id: room_id });
        const clearedResp = clearDBRespDefaultFields(dbResp);

        expect(dbResp).toHaveLength(1);
        expect(clearedResp[0]).toEqual(expect.objectContaining({...itemToCreate, _id: expect.any(ObjectId)}));
    });

    it('Should return saved item data, if input is valid', async () => {
        const [result, errors] = await itemService.createOne(itemToCreate);

        expect(errors).toBeNull();
        expect(result).toEqual(expect.objectContaining({...itemToCreate, _id: expect.any(ObjectId)}));
    });

    it('Should not save any data in DB, if the provided name is null', async () => {
        const invalidItem = {...itemToCreate, name: null} as any;
        await itemService.createOne(invalidItem);

        const dbResp = await itemModel.findOne({ room_id: room_id });

        expect(dbResp).toBeNull();
    });

    it('Should return ServiceError with reason REQUIRED, if the provided name is null', async () => {
        const invalidItem = {...itemToCreate, name: null} as any;
        const [result, errors] = await itemService.createOne(invalidItem);

        expect(result).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should not throw any error if provided input is null or undefined', async () => {
        const nullInput = async () => await itemService.createOne(null);
        const undefinedInput = async () => await itemService.createOne(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});