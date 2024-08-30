import { Expose, Type } from "class-transformer";
import AddType from "../../common/base/decorator/AddType.decorator";
import { ExtractField } from "../../common/decorator/response/ExtractField";
import { RoomDto } from "../../room/dto/room.dto";

@AddType('SoulHomeDto')
export class SoulHomeDto {
    @ExtractField()
    @Expose()
    _id: string;
    
    @Expose()
    type:string;

    @Expose()
    clan_id:string;
    
    @Expose()
    rooms:Array<string>;

    @Type(() => RoomDto)
    @Expose()
    Room: RoomDto[];
}