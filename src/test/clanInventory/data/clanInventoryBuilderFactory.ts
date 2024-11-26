import CreateItemDtoBuilder from "./item/createItemDtoBuilder";
import MoveItemDtoBuilder from "./item/moveItemDtoBuilder";
import StealItemsDtoBuilder from "./item/stealItemsDtoBuilder";
import UpdateItemDtoBuilder from "./item/updateItemDtoBuilder";
import ActivateRoomDtoBuilder from "./room/ActivateRoomDtoBuilder";
import CreateRoomDtoBuilder from "./room/CreateRoomDtoBuilder";
import UpdateRoomDtoBuilder from "./room/UpdateRoomDtoBuilder";
import CreateSoulHomeDtoBuilder from "./soulhome/CreateSoulHomeDtoBuilder";
import UpdateSoulHomeDtoBuilder from "./soulhome/UpdateSoulHomeDtoBuilder";
import CreateStockDtoBuilder from "./stock/CreateStockDtoBuilder";
import UpdateStockDtoBuilder from "./stock/UpdateStockDtoBuilder";
import ItemBuilder from "./item/ItemBuilder";
import RoomBuilder from "./room/RoomBuilder";
import SoulHomeBuilder from "./soulhome/SoulHomeBuilder";
import StockBuilder from "./stock/StockBuilder";


type BuilderName =
    'CreateItemDto' | 'MoveItemDto' | 'StealItemsDto' | 'UpdateItemDto' | 'Item' |
    'ActivateRoomDto' | 'CreateRoomDto' | 'UpdateRoomDto' | 'Room' |
    'CreateSoulHomeDto' | 'UpdateSoulHomeDto' | 'SoulHome' |
    'CreateStockDto' | 'UpdateStockDto' | 'Stock';

type BuilderMap = {
    CreateItemDto: CreateItemDtoBuilder,
    MoveItemDto: MoveItemDtoBuilder,
    StealItemsDto: StealItemsDtoBuilder,
    UpdateItemDto: UpdateItemDtoBuilder,
    Item: ItemBuilder,

    ActivateRoomDto: ActivateRoomDtoBuilder,
    CreateRoomDto: CreateRoomDtoBuilder,
    UpdateRoomDto: UpdateRoomDtoBuilder,
    Room: RoomBuilder,

    CreateSoulHomeDto: CreateSoulHomeDtoBuilder,
    UpdateSoulHomeDto: UpdateSoulHomeDtoBuilder,
    SoulHome: SoulHomeBuilder,

    CreateStockDto: CreateStockDtoBuilder,
    UpdateStockDto: UpdateStockDtoBuilder,
    Stock: StockBuilder
};

export default class ClanInventoryBuilderFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'CreateItemDto':
                return new CreateItemDtoBuilder() as BuilderMap[T];
            case 'MoveItemDto':
                return new MoveItemDtoBuilder() as BuilderMap[T];
            case 'StealItemsDto':
                return new StealItemsDtoBuilder() as BuilderMap[T];
            case 'UpdateItemDto':
                return new UpdateItemDtoBuilder() as BuilderMap[T];
            case 'Item':
                return new ItemBuilder() as BuilderMap[T];

            case 'ActivateRoomDto':
                return new ActivateRoomDtoBuilder() as BuilderMap[T];
            case 'CreateRoomDto':
                return new CreateRoomDtoBuilder() as BuilderMap[T];
            case 'UpdateRoomDto':
                return new UpdateRoomDtoBuilder() as BuilderMap[T];
            case 'Room':
                return new RoomBuilder() as BuilderMap[T];

            case 'CreateSoulHomeDto':
                return new CreateSoulHomeDtoBuilder() as BuilderMap[T];
            case 'UpdateSoulHomeDto':
                return new UpdateSoulHomeDtoBuilder() as BuilderMap[T];
            case 'SoulHome':
                return new SoulHomeBuilder() as BuilderMap[T];

            case 'CreateStockDto':
                return new CreateStockDtoBuilder() as BuilderMap[T];
            case 'UpdateStockDto':
                return new UpdateStockDtoBuilder() as BuilderMap[T];
            case 'Stock':
                return new StockBuilder() as BuilderMap[T];

            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}