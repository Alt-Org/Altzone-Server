import { MoveItemDto } from "../../../../clan_module/item/dto/moveItem.dto";
import { MoveTo } from "../../../../clan_module/item/enum/moveTo.enum";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class MoveItemDtoBuilder implements IDataBuilder<MoveItemDto> {
    private readonly base: MoveItemDto = {
        item_id: undefined,
        moveTo: MoveTo.ROOM,
        destination_id: undefined
    };

    build() {
        return { ...this.base };
    }

    setItemId(item_id: string) {
        this.base.item_id = item_id;
        return this;
    }

    setMoveTo(moveTo: MoveTo) {
        this.base.moveTo = moveTo;
        return this;
    }

    setDestinationId(destination_id: string) {
        this.base.destination_id = destination_id;
        return this;
    }
}