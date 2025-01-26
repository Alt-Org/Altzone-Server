import {Room} from "../../../../clanInventory/room/room.schema";

export default class RoomBuilder {
    private readonly base: Partial<Room> = {
        floorType: 'defaultFloor',
        wallType: 'defaultWall',
        deactivationTimestamp: null,
        cellCount: 10,
        hasLift: false,
        soulHome_id: undefined,
        isActive: false,
        _id: undefined
    };

    build() {
        return {...this.base} as Room;
    }

    setFloorType(floorType: string) {
        this.base.floorType = floorType;
        return this;
    }

    setWallType(wallType: string) {
        this.base.wallType = wallType;
        return this;
    }

    setDeactivationTimestamp(timestamp: number) {
        this.base.deactivationTimestamp = timestamp;
        return this;
    }

    setCellCount(cellCount: number) {
        this.base.cellCount = cellCount;
        return this;
    }

    setHasLift(hasLift: boolean) {
        this.base.hasLift = hasLift;
        return this;
    }

    setSoulHomeId(soulHomeId: string) {
        this.base.soulHome_id = soulHomeId;
        return this;
    }

    setIsActive(isActive: boolean) {
        this.base.isActive = isActive;
        return this;
    }

    setId(_id: string) {
        this.base._id = _id;
        return this;
    }
}