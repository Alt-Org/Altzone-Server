import {IsBoolean, IsInt, IsOptional, IsString} from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('CreateClanDto')
export class CreateClanDto {
    @IsString()
    name: string;

    @IsString()
    tag: string;

    @IsInt()
    gameCoins: number;
    
    @IsBoolean()
    @IsOptional()
    isOpen:boolean
}