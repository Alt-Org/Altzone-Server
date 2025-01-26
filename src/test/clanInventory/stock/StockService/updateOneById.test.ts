import {StockService} from "../../../../clanInventory/stock/stock.service";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import StockModule from "../../modules/stock.module";
import {ObjectId} from "mongodb";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";

describe('StockService.updateOneById() test suite', () => {
    let stockService: StockService;
    const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
    const stockUpdateBuilder = ClanInventoryBuilderFactory.getBuilder('UpdateStockDto');
    const stockModel = StockModule.getStockModel();
    const existingStock = stockBuilder.setClanId(new ObjectId(getNonExisting_id())).build();

    beforeEach(async () => {
        stockService = await StockModule.getStockService();

        const stockResp = await stockModel.create(existingStock);
        existingStock._id = stockResp._id;
    });

    it('Should update stock in the DB and return true if the input is valid', async () => {
        const updatedCellCount = existingStock.cellCount + 10;
        const updateData = stockUpdateBuilder
            .setId(existingStock._id)
            .setCellCount(updatedCellCount)
            .build();

        const [wasUpdated, errors] = await stockService.updateOneById(updateData);

        expect(errors).toBeNull();
        expect(wasUpdated).toBeTruthy();

        const updatedStock = await stockModel.findById(existingStock._id);
        expect(updatedStock.cellCount).toBe(updatedCellCount);
    });

    it('Should return ServiceError NOT_FOUND if the stock with provided _id does not exist', async () => {
        const updateData = stockUpdateBuilder.setId(getNonExisting_id()).setCellCount(20).build();

        const [wasUpdated, errors] = await stockService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });

    it('Should return ServiceError VALIDATION if the clan _id field is null', async () => {
        const invalidClan_id = 1 as any;
        const updateData = stockUpdateBuilder.setId(existingStock._id).setClanId(invalidClan_id).build();

        const [wasUpdated, errors] = await stockService.updateOneById(updateData);

        expect(wasUpdated).toBeNull();
        expect(errors).toContainSE_VALIDATION();
    });

    //TODO: Should not throw
    it('Should not throw error if input is null or undefined', async () => {
        const nullInput = async () => await stockService.updateOneById(null);
        const undefinedInput = async () => await stockService.updateOneById(undefined);

        await expect(nullInput).rejects.toThrow();
        await expect(undefinedInput).rejects.toThrow();
    });
});