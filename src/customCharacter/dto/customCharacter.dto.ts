import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {PlayerDto} from "../../player/dto/player.dto";
import {CharacterClassDto} from "../../characterClass/dto/characterClass.dto";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('CustomCharacterDto')
export class CustomCharacterDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    unityKey: string;

    @Expose()
    name: string;

    @Expose()
    speed: number;

    @Expose()
    resistance: number;

    @Expose()
    attack: number;

    @Expose()
    defence: number;

    @Expose()
    hp: number;

    @Expose()
    level: number;

    @ExtractField()
    @Expose()
    characterClass_id: string;

    @ExtractField()
    @Expose()
    player_id: string;

    @Type(() => CharacterClassDto)
    @Expose()
    CharacterClass: CharacterClassDto;

    @Type(() => PlayerDto)
    @Expose()
    Player: PlayerDto;
}