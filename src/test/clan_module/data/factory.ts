import CreateClanDtoBuilder from './clan/CreateClanDtoBuilder';
import JoinRequestDtoBuilder from './clan/JoinRequestDtoBuilder';
import RemovePlayerDtoBuilder from './clan/RemovePlayerDtoBuilder';
import CreateItemDtoBuilder from './item/CreateItemDtoBuilder';
import MoveItemDtoBuilder from './item/MoveItemDtoBuilder';
import StealItemsDtoBuilder from './item/StealItemsDtoBuilder';
import ActivateRoomDtoBuilder from './room/ActivateRoomDtoBuilder';
import CreateRoomDtoBuilder from './room/CreateRoomDtoBuilder';
import CreateSoulHomeDtoBuilder from './soulhome/CreateSoulHomeDtoBuilder';
import CreateStockDtoBuilder from './stock/CreateStockDtoBuilder';

type BuilderName = 
    'CreateClanDto' | 'JoinRequestDto' | 'RemovePlayerDTO' |
    'CreateItemDto' | 'MoveItemDto' | 'StealItemsDto' |
    'ActivateRoomDto' | 'CreateRoomDto' | 'CreateSoulHomeDto' |
    'CreateStockDto';

type BuilderMap = {
    CreateClanDto: CreateClanDtoBuilder,
    JoinRequestDto: JoinRequestDtoBuilder,
    RemovePlayerDTO: RemovePlayerDtoBuilder,
    CreateItemDto: CreateItemDtoBuilder,
    MoveItemDto: MoveItemDtoBuilder,
    StealItemsDto: StealItemsDtoBuilder,
    ActivateRoomDto: ActivateRoomDtoBuilder,
    CreateRoomDto: CreateRoomDtoBuilder,
    CreateSoulHomeDto: CreateSoulHomeDtoBuilder,
    CreateStockDto: CreateStockDtoBuilder
};

export default class Factory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'CreateClanDto':
                return new CreateClanDtoBuilder() as BuilderMap[T];
            case 'JoinRequestDto':
                return new JoinRequestDtoBuilder() as BuilderMap[T];
            case 'RemovePlayerDTO':
                return new RemovePlayerDtoBuilder() as BuilderMap[T];
            case 'CreateItemDto':
                return new CreateItemDtoBuilder() as BuilderMap[T];
            case 'MoveItemDto':
                return new MoveItemDtoBuilder() as BuilderMap[T];
            case 'StealItemsDto':
                return new StealItemsDtoBuilder() as BuilderMap[T];
            case 'ActivateRoomDto':
                return new ActivateRoomDtoBuilder() as BuilderMap[T];
            case 'CreateRoomDto':
                return new CreateRoomDtoBuilder() as BuilderMap[T];
            case 'CreateSoulHomeDto':
                return new CreateSoulHomeDtoBuilder() as BuilderMap[T];
            case 'CreateStockDto':
                return new CreateStockDtoBuilder() as BuilderMap[T];
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}