import {ItemService} from "../../../../clanInventory/item/item.service";
import {ItemName} from "../../../../clanInventory/item/enum/itemName.enum";
import {QualityLevel} from "../../../../clanInventory/item/enum/qualityLevel.enum";
import ItemModule from "../../modules/item.module";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";

describe('ItemService.updateMany() test suite', () => {
    let itemService: ItemService;
    const itemModel = ItemModule.getItemModel();
    const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');

    const item1 = itemBuilder.setName(ItemName.ARMCHAIR_RAKKAUS).setQualityLevel(QualityLevel.common).build();
    const item2 = itemBuilder.setName(ItemName.CLOSET_RAKKAUS).setQualityLevel(QualityLevel.common).build();
    const item3 = itemBuilder.setName(ItemName.SOFATABLE_RAKKAUS).setQualityLevel(QualityLevel.common).build();
    const allItemsFilter = { qualityLevel: QualityLevel.common };

    beforeEach(async () => {
        itemService = await ItemModule.getItemService();
        const dbResp1 = await itemModel.create(item1);
        const dbResp2 = await itemModel.create(item2);
        const dbResp3 = await itemModel.create(item3);
        item1._id = dbResp1._id.toString();
        item2._id = dbResp2._id.toString();
        item3._id = dbResp3._id.toString();
    });

    it('Should update all items that match the provided filter', async () => {
        const updateData: any = { price: 15674 };

        const [wasUpdated, errors] = await itemService.updateMany(updateData, { filter: allItemsFilter });

        expect(errors).toBeNull();
        expect(wasUpdated).toBe(true);

        const updatedItems = await itemModel.find(allItemsFilter);
        updatedItems.forEach(item => {
            expect(item).toHaveProperty('price', updateData.price);
        });
    });

    it('Should return ServiceError NOT_FOUND if no objects match the provided filter', async () => {
        const filter = { name: 'non-existing' };
        const updateData: any = { price: 15674 };

        const [wasUpdated, errors] = await itemService.updateMany(updateData, { filter });

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should not throw any error if input is null or undefined', async () => {
        const nullInput = async () => await itemService.updateMany(null, { filter: allItemsFilter });
        const undefinedInput = async () => await itemService.updateMany(undefined, { filter: allItemsFilter });

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});