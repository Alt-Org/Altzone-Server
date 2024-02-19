import { IsMongoId, IsString } from "class-validator";

export class CreateSoulHomeDto {
    @IsString()
    type: string

    @IsMongoId()
    clan_id:string
 
    
    
}