import { IsString } from "class-validator";
import AddType from "../../../common/base/decorator/AddType.decorator";

@AddType('CreateShopDto')
export class CreateShopDto {
    @IsString()

    name:string;
    
}