import {Expose, Type} from "class-transformer";
import {PlayerDto} from "../../player/dto/player.dto";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {IsPlayerExists} from "../../player/decorator/validation/IsPlayerExists.decorator";
import {IsMongoId, IsOptional} from "class-validator";

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

    // @ExtractField()
    // @Expose()
    // player_id: string;

    @Type(() => PlayerDto)
    @Expose()
    Player: PlayerDto[];
}