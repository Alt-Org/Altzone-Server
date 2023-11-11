import {IsMongoId, IsString} from "class-validator";
import {IsChatExists} from "../decorator/validation/IsChatExists.decorator";
import {Optional} from "@nestjs/common";

export class UpdateChatDto {
    @IsChatExists()
    @IsMongoId()
    _id: string;

    @Optional()
    @IsString()
    name?: string;
}