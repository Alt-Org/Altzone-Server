import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {PlayerDto} from "../../player/dto/player.dto";
import {CharacterClassDto} from "../../characterClass/dto/characterClass.dto";

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