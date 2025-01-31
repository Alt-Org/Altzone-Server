import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../../common/decorator/response/ExtractField";
import {PlayerDto} from "../../dto/player.dto";
import AddType from "../../../common/base/decorator/AddType.decorator";
import {CharacterId} from "../enum/characterId.enum";

@AddType('CustomCharacterDto')
export class CustomCharacterDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    characterId: CharacterId;

    @Expose()
    defence: number;

    @Expose()
    hp: number;

    @Expose()
    size: number;

    @Expose()
    speed: number;

    @Expose()
    attack: number;

    @Expose()
    level: number;

    @ExtractField()
    @Expose()
    player_id: string;

    @Type(() => PlayerDto)
    @Expose()
    Player: PlayerDto;
}