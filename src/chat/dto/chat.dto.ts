import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {MessageDto} from "./message.dto";

export class ChatDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name?: string;

    @Type(() => MessageDto)
    @Expose()
    messages: MessageDto[];
}