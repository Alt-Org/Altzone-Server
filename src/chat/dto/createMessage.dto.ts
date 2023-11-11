import {IsInt, IsString} from "class-validator";

export class CreateMessageDto {
    @IsString()
    _id: string;

    @IsString()
    senderUsername: string;

    @IsString()
    content: string;

    @IsInt()
    feeling: number;
}