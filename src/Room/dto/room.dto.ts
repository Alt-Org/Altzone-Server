import { Expose } from "class-transformer";
import { IsString } from "class-validator";
import AddType from "src/common/base/decorator/AddType.decorator";
import { ExtractField } from "src/common/decorator/response/ExtractField";

@AddType('RoomDto')
export class RoomDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    floorType:string;

    @Expose()
    wallType:string;

    @Expose()
    isActive:boolean;

    @Expose()
    roomItems:Array<string>;

    @Expose()
    player_id:string;

    @Expose()
    soulhome_id:string;
}