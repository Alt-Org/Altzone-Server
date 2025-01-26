import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {ModelName} from "../../../../common/enum/modelName.enum";
import {ItemService} from "../../../../clanInventory/item/item.service";
import ItemModule from "../../modules/item.module";
import StockModule from "../../modules/stock.module";
import {ObjectId} from "mongodb";

describe('ItemService.readOneById() test suite', () => {
    let itemService: ItemService;
    const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
    const itemModel = ItemModule.getItemModel();
    const existingItem = itemBuilder.build();

    const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
    const stockModel = StockModule.getStockModel();
    const existingStock = stockBuilder.setClanId(new ObjectId(getNonExisting_id())).build();

    beforeEach(async () => {
        const createdStock = await stockModel.create(existingStock);
        existingStock._id = createdStock._id;

        itemService = await ItemModule.getItemService();
        existingItem.stock_id = existingStock._id as any;
        const createdItem = await itemModel.create(existingItem);
        existingItem._id = createdItem._id;
    });

    it('Should find existing item from DB', async () => {
        const [item, errors] = await itemService.readOneById(existingItem._id);

        const clearedItem = clearDBRespDefaultFields(item);

        expect(errors).toBeNull();
        expect(clearedItem).toEqual(expect.objectContaining(existingItem));
    });

    it('Should return fields only requested in "select"', async () => {
        const [item, errors] = await itemService.readOneById(existingItem._id, { select: [ '_id', 'name' ] });

        const clearedRoom = clearDBRespDefaultFields(item);
        const expected = { _id: existingItem._id, name: existingItem.name };

        expect(errors).toBeNull();
        expect(clearedRoom).toEqual(expected);
    });

    it('Should return NOT_FOUND SError for non-existing item', async () => {
        const [item, errors] = await itemService.readOneById(getNonExisting_id());

        expect(item).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return VALIDATION SError if provided _id is not valid', async () => {
        const invalid_id = 'not-valid';

        const [item, errors] = await itemService.readOneById(invalid_id);

        expect(item).toBeNull();
        expect(errors).toContainSE_VALIDATION();
    });

    it('Should not throw if provided _id is null or undefined', async () => {
        const null_idCall = async () => await itemService.readOneById(null);
        const undefined_idCall = async () => await itemService.readOneById(undefined);

        expect(null_idCall).not.toThrow();
        expect(undefined_idCall).not.toThrow();
    });

    it('Should return NOT_FOUND if provided _id is null or undefined', async () => {
        const [itemNullCall, errorsNullCall] = await itemService.readOneById(null);
        const [itemUndefinedCall, errorsCall] = await itemService.readOneById(undefined);

        expect(itemNullCall).toBeNull();
        expect(errorsNullCall).toContainSE_NOT_FOUND();

        expect(itemUndefinedCall).toBeNull();
        expect(errorsCall).toContainSE_NOT_FOUND();
    });

    it('Should get item\'s collection references if they exists in DB', async () => {
        const [item, errors] = await itemService.readOneById(
            existingItem._id,
            { includeRefs: [ ModelName.STOCK ] }
        );

        expect(errors).toBeNull();

        const clearedStock = clearDBRespDefaultFields(item['Stock']);
        expect(clearedStock).toMatchObject(existingStock);
    });

    it('Should ignore non-existing schema references requested', async () => {
        const nonExistingReferences: any = [ 'non-existing' ];
        const [item, errors] = await itemService.readOneById(existingItem._id, { includeRefs: nonExistingReferences });

        expect(errors).toBeNull();
        expect(item['non-existing']).toBeUndefined();
    });
});