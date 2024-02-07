import { IsMongoId, IsOptional, IsString } from "class-validator";

export class updateSoulHomeDto {
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    type:string;

}