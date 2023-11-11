import {IsString} from "class-validator";
import {Optional} from "@nestjs/common";

export class CreateChatDto {
    @Optional()
    @IsString()
    name?: string;
}