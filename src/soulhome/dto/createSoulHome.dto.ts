import { IsMongoId, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('CreateSoulHomeDto')
export class CreateSoulHomeDto {
    @IsString()
    type: string

    @IsMongoId()
    clan_id:string
 
    
    
}