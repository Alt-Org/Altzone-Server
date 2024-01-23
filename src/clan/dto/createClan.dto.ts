import {IsBoolean, IsInt, IsOptional, IsString} from "class-validator";

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