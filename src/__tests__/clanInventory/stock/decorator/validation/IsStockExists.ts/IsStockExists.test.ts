import StockModule from "../../../../modules/stock.module";
import {isStockExists} from "../../../../../../clanInventory/stock/decorator/validation/IsStockExists.decorator";
import ClanInventoryBuilderFactory from "../../../../data/clanInventoryBuilderFactory";
import {getNonExisting_id} from "../../../../../test_utils/util/getNonExisting_id";

describe('@IsStockExists() test suite', () => {
    let validator: isStockExists;
    const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
    const stockModel = StockModule.getStockModel();
    const existingStock = stockBuilder.setClanId(getNonExisting_id()).setCellCount(1).build();

    beforeEach(async () => {
        validator = await StockModule.getIsStockExists();

        const stockResp = await stockModel.create(existingStock);
        existingStock._id = stockResp._id;
    });

    it('Should return true if the stock does exist', async () => {
        const doesExists = await validator.validate(existingStock._id);

        expect(doesExists).toBeTruthy();
    });

    it('Should return false if stock does not exist', async () => {
        const doesExists = await validator.validate(getNonExisting_id());

        expect(doesExists).toBeFalsy();
    });
});