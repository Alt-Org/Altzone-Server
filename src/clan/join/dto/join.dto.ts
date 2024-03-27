import { Expose, Type } from "class-transformer";
import { IsClanExists } from "src/clan/decorator/validation/IsClanExists.decorator";
import { ExtractField } from "src/common/decorator/response/ExtractField";
import { PlayerDto } from "src/player/dto/player.dto";

export class JoinDto {
    @ExtractField()
    @Expose()
    _id:string;

    @Expose()
    clan_id: string; // the clan id we are trying to join

    @Expose()
    player_id: string; // the player who is trying to join

    @Expose()
    join_message: string; // join message if clan is private

    @Expose()
    accepted: boolean;// whether you are accepted or you arent

}