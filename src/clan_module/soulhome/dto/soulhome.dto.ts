import { Expose, Type } from "class-transformer";
import { RoomDto } from "../../room/dto/room.dto";
import { ClanDto } from "../../clan/dto/clan.dto";
import AddType from "../../../common/base/decorator/AddType.decorator";
import { ExtractField } from "../../../common/decorator/response/ExtractField";

@AddType('SoulHomeDto')
export class SoulHomeDto {
    @ExtractField()
    @Expose()
    _id: string;
    
    @Expose()
    name: string;

    @Expose()
    clan_id: string;

    @Type(() => RoomDto)
    @Expose()
    Room: RoomDto[];

    @Type(() => ClanDto)
    @Expose()
    Clan: ClanDto;
}