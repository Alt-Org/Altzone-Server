import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {ClanDto} from "../../clan/dto/clan.dto";

export class StockDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    type: number;

    @Expose()
    rowCount: number;

    @Expose()
    columnCount: number;

    @ExtractField()
    @Expose()
    clan_id: string;

    @Type(() => ClanDto)
    @Expose()
    Clan: ClanDto;
}