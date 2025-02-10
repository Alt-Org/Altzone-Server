import {ObjectId} from "mongodb";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import ItemModule from "../../modules/item.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {StockService} from "../../../../clanInventory/stock/stock.service";
import StockModule from "../../modules/stock.module";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ModelName} from "../../../../common/enum/modelName.enum";

describe('StockService.readAll() test suite', () => {
    let stockService: StockService;
    const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
    const stockModel = StockModule.getStockModel();
    const clan_id = new ObjectId(getNonExisting_id());
    const stock1 = stockBuilder.setClanId(clan_id).setCellCount(1).build();
    const stock2 = stockBuilder.setClanId(clan_id).setCellCount(1).build();

    const itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');
    const itemModel = ItemModule.getItemModel();
    let existingItem1 = itemBuilder.build();
    let existingItem2 = itemBuilder.build();

    beforeEach(async () => {
        stockService = await StockModule.getStockService();

        const stock1Resp = await stockModel.create(stock1);
        stock1._id = stock1Resp._id;
        const stock2Resp = await stockModel.create(stock2);
        stock2._id = stock2Resp._id;

        existingItem1.stock_id = stock1._id as any;
        existingItem2.stock_id = stock2._id as any;
        await itemModel.create(existingItem1);
        await itemModel.create(existingItem2);
    });

    it('Should return all stocks that match the provided filter', async () => {
        const [stocks, errors] = await stockService.readAll({ filter: { clan_id: clan_id } });

        expect(errors).toBeNull();
        expect(stocks).toHaveLength(2);
        expect(stocks).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ...stock1 }),
                expect.objectContaining({ ...stock2 }),
            ])
        );
    });

    it('Should return stocks with only specified fields using options.select', async () => {
        const select = ['_id', 'cellCount'];

        const [stocks, errors] = await stockService.readAll({ filter: { clan_id: clan_id }, select });

        const clearedClans = clearDBRespDefaultFields(stocks);

        expect(errors).toBeNull();
        expect(clearedClans).toEqual([
            expect.objectContaining({ cellCount: stock1.cellCount, _id: expect.any(ObjectId) }),
            expect.objectContaining({ cellCount: stock2.cellCount, _id: expect.any(ObjectId) })
        ]);
    });

    it('Should limit the number of returned stocks using options.limit', async () => {
        const limit = 1;

        const [stocks, errors] = await stockService.readAll({ filter: { clan_id: clan_id }, limit });

        expect(errors).toBeNull();
        expect(stocks).toHaveLength(1);
    });

    it('Should skip specified number of stocks using options.skip', async () => {
        const skip = 1;

        const [clans, errors] = await stockService.readAll({ filter: { clan_id: clan_id }, skip, sort: {cellCount: 1} });

        expect(errors).toBeNull();
        expect(clans).toHaveLength(1);
        expect(clans).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ cellCount: stock2.cellCount })
            ])
        );
    });

    it('Should return sorted stocks using options.sort', async () => {
        const sort = { cellCount: 1 } as any;

        const [stocks, errors] = await stockService.readAll({ filter: { clan_id: clan_id }, sort });

        expect(errors).toBeNull();
        expect(
            stocks.map(stock => stock.cellCount)).toEqual([stock1.cellCount, stock2.cellCount]
        );
    });

    it('Should return stocks with reference objects using options.includeRefs', async () => {
        const [stocks, errors] = await stockService.readAll({ filter: { clan_id: clan_id }, includeRefs: [ModelName.ITEM] });

        expect(errors).toBeNull();

        const item1Ref = stocks[0].Item[0];
        const clearedItem1 = clearDBRespDefaultFields(item1Ref);
        const item2Ref = stocks[1].Item[0];
        const clearedItem2 = clearDBRespDefaultFields(item2Ref);

        expect(clearedItem1).toEqual(expect.objectContaining({...existingItem1, _id: expect.any(ObjectId)}));
        expect(clearedItem2).toEqual(expect.objectContaining({...existingItem2, _id: expect.any(ObjectId)}));
    });

    it('Should return ServiceError NOT_FOUND if no stocks match the filter', async () => {
        const filter = { cellCount: -12345789 };

        const [stocks, errors] = await stockService.readAll({ filter });

        expect(stocks).toBeNull();
        expect(errors).toContainSE_NOT_FOUND();
    });
});