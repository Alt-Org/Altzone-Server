import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {ClanDto} from "../../clan/dto/clan.dto";
import {PlayerDto} from "../../player/dto/player.dto";

export class StockDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    type: number;

    @Expose()
    rowCount: number;

    @Expose()
    colCount: number;

    @ExtractField()
    @Expose()
    player_id: string;

    @ExtractField()
    @Expose()
    clan_id: string;

    @Type(() => PlayerDto)
    @Expose()
    Player: PlayerDto;

    @Type(() => ClanDto)
    @Expose()
    Clan: ClanDto;
}