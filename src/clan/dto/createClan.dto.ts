import { IsArray, ArrayMaxSize, IsEnum, IsInt, IsBoolean, IsOptional, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { ClanLabel } from '../../common/enum/clanLabel.enum';

@AddType('CreateClanDto')
export class CreateClanDto {
    @IsString()
    name: string;

    @IsArray()
    @ArrayMaxSize(5)
    @IsEnum(ClanLabel, { each: true })
    labels?: string[];

    @IsInt()
    gameCoins: number;

    @IsBoolean()
    @IsOptional()
    isOpen:boolean
}