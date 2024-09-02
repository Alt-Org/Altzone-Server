import { IsMongoId, IsString } from "class-validator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('UpdateSoulHomeDto')
export class UpdateSoulHomeDto {
    @IsMongoId()
    _id: string;

    @IsString()
    name?: string;
}