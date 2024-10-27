import {IsEnum, IsInt, IsString} from "class-validator";
import {GestaltCycle} from "../../common/enum/gestaltCycle.enum";
import AddType from "../../common/base/decorator/AddType.decorator";

/**
 * This class is used for validation incoming requests while creating a CharacterClass.
 *
 * Notice that if the validation will be failed the controller method will not be called and Bad Request error will be returned to client.
 * You do not have to do a thing about the validation, only specify the decorators for checking and that's it
 */
@AddType('CreateCharacterClassDto')
export class CreateCharacterClassDto {
    //class-validator decorator for checking is the provided field string or not
    @IsString()
    name: string;

    @IsEnum(GestaltCycle)
    gestaltCycle: GestaltCycle;

    @IsInt()
    speed: number;

    @IsInt()
    resistance: number;

    @IsInt()
    attack: number;

    @IsInt()
    defence: number;

    @IsInt()
    hp: number;
}