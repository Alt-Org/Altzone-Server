import {MoveItemDto} from "../../../../clanInventory/item/dto/moveItem.dto";
import {MoveTo} from "../../../../clanInventory/item/enum/moveTo.enum";

export default class MoveItemDtoBuilder {
    private readonly base: Partial<MoveItemDto> = {
        item_id: 'defaultItemId',
        moveTo: MoveTo.STOCK,
        destination_id: undefined
    };

    build(): MoveItemDto {
        return { ...this.base } as MoveItemDto;
    }

    setItemId(itemId: string) {
        this.base.item_id = itemId;
        return this;
    }

    setMoveTo(moveTo: MoveTo) {
        this.base.moveTo = moveTo;
        return this;
    }

    setDestinationId(destinationId: string) {
        this.base.destination_id = destinationId;
        return this;
    }
}