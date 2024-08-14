import {IsMongoId, IsString} from "class-validator";
import {IsChatExists} from "../decorator/validation/IsChatExists.decorator";
import {Optional} from "@nestjs/common";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('UpdateChatDto')
export class UpdateChatDto {
    @IsChatExists()
    @IsMongoId()
    _id: string;

    @Optional()
    @IsString()
    name?: string;
}