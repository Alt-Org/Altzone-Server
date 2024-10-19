import { ActivateRoomDto } from "../../../../clan_module/room/dto/ActivateRoom.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class ActivateRoomDtoBuilder implements IDataBuilder<ActivateRoomDto> {
    private readonly base: ActivateRoomDto = {
        room_ids: ['defaultRoomId1', 'defaultRoomId2'],
        durationS: 3600 
    };

    build() {
        return { ...this.base };
    }

    setRoomIds(room_ids: string[]) {
        this.base.room_ids = room_ids;
        return this;
    }

    setDurationS(durationS: number) {
        this.base.durationS = durationS;
        return this;
    }
}