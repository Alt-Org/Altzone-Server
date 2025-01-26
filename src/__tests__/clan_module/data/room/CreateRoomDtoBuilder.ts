import { CreateRoomDto } from "../../../../clan_module/room/dto/createRoom.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class CreateRoomDtoBuilder implements IDataBuilder<CreateRoomDto> {
    private readonly base: CreateRoomDto = {
        floorType: 'defaultFloorType',
        wallType: 'defaultWallType',
        hasLift: false,
        cellCount: 4,
        soulHome_id: 'defaultSoulHomeId'
    };

    build() {
        return { ...this.base };
    }

    setFloorType(floorType: string) {
        this.base.floorType = floorType;
        return this;
    }

    setWallType(wallType: string) {
        this.base.wallType = wallType;
        return this;
    }

    setHasLift(hasLift: boolean) {
        this.base.hasLift = hasLift;
        return this;
    }

    setCellCount(cellCount: number) {
        this.base.cellCount = cellCount;
        return this;
    }

    setSoulHomeId(soulHome_id: string) {
        this.base.soulHome_id = soulHome_id;
        return this;
    }
}