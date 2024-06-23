import {IsString} from "class-validator";
import {Optional} from "@nestjs/common";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('CreateChatDto')
export class CreateChatDto {
    @Optional()
    @IsString()
    name?: string;
}