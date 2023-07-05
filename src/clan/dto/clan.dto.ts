import {Expose, Type} from "class-transformer";
import {PlayerDto} from "../../player/dto/player.dto";
import {ExtractField} from "../../common/decorator/response/ExtractField";

export class ClanDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    tag: string;

    @Expose()
    gameCoins: number;

    @Type(() => PlayerDto)
    @Expose()
    Player: PlayerDto[];
}