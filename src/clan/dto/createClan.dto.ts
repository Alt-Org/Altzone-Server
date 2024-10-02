import { IsArray, ArrayMaxSize, IsEnum, IsInt, IsBoolean, IsOptional, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { ClanLabel } from '../enum/clanLabel.enum';

@AddType('CreateClanDto')
export class CreateClanDto {
    @IsString()
    name: string;

    @IsString()
    tag: string;

    @IsArray()
    @ArrayMaxSize(5)
    @IsEnum(ClanLabel, { each: true })
    labels: ClanLabel[];

    @IsInt()
    gameCoins: number;

    @IsBoolean()
    @IsOptional()
    isOpen:boolean
}