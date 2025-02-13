import {
    ArrayMaxSize, ArrayMinSize,
    IsArray,
    IsOptional,
    IsString,
} from "class-validator";


export class CreateBoxDto {
    @IsString()
    adminPassword: string;

    @IsString()
    playerName?: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsString({each: true})
    clanNames?: string[];
}
