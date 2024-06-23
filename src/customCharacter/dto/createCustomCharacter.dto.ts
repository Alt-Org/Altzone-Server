import {IsInt, IsMongoId, IsString} from "class-validator";
import {IsCharacterClassExists} from "../../characterClass/decorator/validation/IsCharacterClassExists.decorator";
import {IsPlayerExists} from "../../player/decorator/validation/IsPlayerExists.decorator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('CreateCustomCharacterDto')
export class CreateCustomCharacterDto {
    @IsString()
    unityKey: string;

    @IsString()
    name: string;

    @IsInt()
    speed: number;

    @IsInt()
    resistance: number;

    @IsInt()
    attack: number;

    @IsInt()
    defence: number;

    @IsCharacterClassExists()
    @IsMongoId()
    characterClass_id: string;

    @IsPlayerExists()
    @IsMongoId()
    player_id: string;
}