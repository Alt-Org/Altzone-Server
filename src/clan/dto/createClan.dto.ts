import { IsArray, ArrayMaxSize, IsEnum, IsInt, IsBoolean, IsOptional, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { ClanLabel } from '../enum/clanLabel.enum';
import { AgeRange } from "../enum/ageRange.enum";
import { Language } from "../../common/enum/language.enum";
import { Goal } from "../enum/goal.enum";

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
    isOpen?: boolean

    @IsEnum(AgeRange)
    @IsOptional()
    ageRange?: AgeRange;

    @IsEnum(Goal)
    @IsOptional()
    goal?: Goal;

    @IsString()
    phrase: string;

    @IsEnum(Language)
    @IsOptional()
    language?: Language;
}