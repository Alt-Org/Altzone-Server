import {Expose, Type} from "class-transformer";
import {PlayerDto} from "../../player/dto/player.dto";
import {ExtractField} from "../../decorator/ExtractField";

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