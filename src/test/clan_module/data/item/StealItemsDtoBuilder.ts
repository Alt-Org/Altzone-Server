import { StealItemsDto } from "../../../../clan_module/item/dto/stealItems.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class StealItemsDtoBuilder implements IDataBuilder<StealItemsDto> {
    private readonly base: StealItemsDto = {
        steal_token: 'defaultStealToken',
        item_ids: ['defaultItemId1', 'defaultItemId2'],
        room_id: 'defaultRoomId'
    };

    build() {
        return { ...this.base };
    }

    setStealToken(steal_token: string) {
        this.base.steal_token = steal_token;
        return this;
    }

    setItemIds(item_ids: string[]) {
        this.base.item_ids = item_ids;
        return this;
    }

    setRoomId(room_id: string) {
        this.base.room_id = room_id;
        return this;
    }
}