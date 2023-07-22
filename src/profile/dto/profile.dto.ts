import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {PlayerDto} from "../../player/dto/player.dto";

export class ProfileDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    username: string;

    @Type(() => PlayerDto)
    @Expose()
    Player: PlayerDto;
}