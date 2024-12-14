import ClanBuilderFactory from "../data/clanBuilderFactory";
import ClanModule from "../modules/clan.module";
import ClanHelperService from "../../../clan/utils/clanHelper.service";
import StockModule from "../../clanInventory/modules/stock.module";
import ItemModule from "../../clanInventory/modules/item.module";
import {ItemName} from "../../../clanInventory/item/enum/itemName.enum";

describe('ClanHelperService.createDefaultStock() test suite', () => {
    let clanHelperService: ClanHelperService;
    const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    const clanModel = ClanModule.getClanModel();
    const stockModel = StockModule.getStockModel();
    const itemModel = ItemModule.getItemModel();

    const existingClan = clanBuilder.build();

    beforeEach(async () => {
        clanHelperService = await ClanModule.getClanHelperService();
        const createdClan = await clanModel.create(existingClan);
        existingClan._id = createdClan._id;
    });

    it('Should create a new Stock for a specified clan', async () => {
        await clanHelperService.createDefaultStock(existingClan._id);

        const createdStock = await stockModel.findOne({clan_id: existingClan._id});

        expect(createdStock).not.toBeNull();
    });

    it('Should add default items to the created stock', async () => {
        await clanHelperService.createDefaultStock(existingClan._id);

        const createdStock = await stockModel.findOne({clan_id: existingClan._id});

        const createdItems = await itemModel.find({ stock_id: createdStock._id });

        expect(createdItems).toMatchObject([
            { stock_id: createdStock._id, unityKey: ItemName.CARPET_RAKKAUS },
            { stock_id: createdStock._id, unityKey: ItemName.MIRROR_RAKKAUS },
            { stock_id: createdStock._id, unityKey: ItemName.CLOSET_RAKKAUS }
        ]);
    });
});