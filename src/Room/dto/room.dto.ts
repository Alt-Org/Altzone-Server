import { Expose } from "class-transformer";
import { IsString } from "class-validator";
import { ExtractField } from "src/common/decorator/response/ExtractField";

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