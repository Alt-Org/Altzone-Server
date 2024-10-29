import { Expose } from "class-transformer";
import AddType from "../../common/base/decorator/AddType.decorator";
import { ExtractField } from "../../common/decorator/response/ExtractField";

@AddType('RoomDto')
export class RoomDto {
    @ExtractField()
    @Expose()
    _id:string;

    @Expose()
    floorType: string;

    @Expose()
    wallType: string;

    @Expose()
    isActive: boolean;

    @Expose()
    hasLift: boolean;

    @Expose()
    deactivationTimestamp: number;

    @Expose()
    cellCount: number;

    @Expose()
    soulHome_id:string;
}