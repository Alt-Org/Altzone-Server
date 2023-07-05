import {Expose} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";

export class RaidRoomDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    type: number;

    @Expose()
    rowCount: number;

    @Expose()
    colCount: number;

    @Expose()
    player_id: string;

    @Expose()
    clan_id: string;
}