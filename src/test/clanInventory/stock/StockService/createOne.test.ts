import {StockService} from "../../../../clanInventory/stock/stock.service";
import ClanInventoryBuilderFactory from "../../data/clanInventoryBuilderFactory";
import StockModule from "../../modules/stock.module";
import {getNonExisting_id} from "../../../test_utils/util/getNonExisting_id";
import {clearDBRespDefaultFields} from "../../../test_utils/util/removeDBDefaultFields";
import {ObjectId} from "mongodb";


describe('StockService.createOne() test suite', () => {
    let stockService: StockService;
    const stockCreateBuilder = ClanInventoryBuilderFactory.getBuilder('CreateStockDto');
    const stockModel = StockModule.getStockModel();
    const clan_id = new ObjectId(getNonExisting_id());
    const stockToCreate = stockCreateBuilder.setClanId(clan_id).build();

    beforeEach(async () => {
        stockService = await StockModule.getStockService();
    });

    it('Should save stock data to DB if input is valid', async () => {
        await stockService.createOne(stockToCreate);

        const dbResp = await stockModel.find({ clan_id: clan_id });
        const stockInDB = dbResp[0]?.toObject();

        const clearedStock = clearDBRespDefaultFields(stockInDB);

        expect(dbResp).toHaveLength(1);
        expect(clearedStock).toEqual(expect.objectContaining({...stockToCreate, _id: expect.any(ObjectId)}));
    });

    it('Should return saved stock data, if input is valid', async () => {
        const [stock, errors] = await stockService.createOne(stockToCreate);

        expect(errors).toBeNull();
        expect(stock).toEqual(expect.objectContaining({...stockToCreate}));
    });

    it('Should not save any data, if the provided input not valid', async () => {
        const wrongCellCount = 'not-number';
        const invalidStock = {...stockToCreate, cellCount: wrongCellCount} as any;
        await stockService.createOne(invalidStock);

        const dbResp = await stockModel.findOne({ clan_id: clan_id });

        expect(dbResp).toBeNull();
    });

    it('Should return ServiceError with reason REQUIRED if cellCount field is not provided', async () => {
        const invalidClan = {...stockToCreate, cellCount: undefined} as any;
        const [stock, errors] = await stockService.createOne(invalidClan);

        expect(stock).toBeNull();
        expect(errors).toContainSE_REQUIRED();
    });

    it('Should not throw any error if provided input is null or undefined', async () => {
        const nullInput = async () => await stockService.createOne(null);
        const undefinedInput = async () => await stockService.createOne(undefined);

        expect(nullInput).not.toThrow();
        expect(undefinedInput).not.toThrow();
    });
});