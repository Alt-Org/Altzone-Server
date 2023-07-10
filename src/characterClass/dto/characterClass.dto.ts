import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {GestaltCycle} from "../../common/enum/gestaltCycle.enum";
import {CustomCharacterDto} from "../../customCharacter/dto/customCharacter.dto";

export class CharacterClassDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    gestaltCycle: GestaltCycle;

    @Expose()
    speed: number;

    @Expose()
    resistance: number;

    @Expose()
    attack: number;

    @Expose()
    defence: number;

    @Type(() => CustomCharacterDto)
    @Expose()
    CustomCharacter: CustomCharacterDto[];
}