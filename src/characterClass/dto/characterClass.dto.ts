import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {GestaltCycle} from "../../common/enum/gestaltCycle.enum";
import {CustomCharacterDto} from "../../customCharacter/dto/customCharacter.dto";
import AddType from "../../common/base/decorator/AddType.decorator";

/**
 * This is a DTO class = data transfer object.
 * CharacterClassDto is used to sent data of CharacterClass to the client side.
 * As u can see here is no validation decorators.
 */
@AddType('CharacterClassDto')
export class CharacterClassDto {
    //Used for _id fields only
    @ExtractField()
    @Expose()
    _id: string;

    //Include this field in the response
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

    //Transform the field object(s) to an appropriate class
    @Type(() => CustomCharacterDto)
    @Expose()
    CustomCharacter: CustomCharacterDto[];
}