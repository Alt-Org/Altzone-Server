import ClanInventoryBuilderFactory from "../../../../data/clanInventoryBuilderFactory";
import {getNonExisting_id} from "../../../../../test_utils/util/getNonExisting_id";
import {isItemExists} from "../../../../../../clanInventory/item/decorator/validation/IsItemExists.decorator";
import ItemModule from "../../../../modules/item.module";

describe('@IsItemExists() test suite', () => {
    let validator: isItemExists;
    const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
    const itemModel = ItemModule.getItemModel();
    const existingItem = itemBuilder.build();

    beforeEach(async () => {
        validator = await ItemModule.getIsItemExists();

        const itemResp = await itemModel.create(existingItem);
        existingItem._id = itemResp._id;
    });

    it('Should return true if the item does exist', async () => {
        const doesExists = await validator.validate(existingItem._id);

        expect(doesExists).toBeTruthy();
    });

    it('Should return false if item does not exist', async () => {
        const doesExists = await validator.validate(getNonExisting_id());

        expect(doesExists).toBeFalsy();
    });
});