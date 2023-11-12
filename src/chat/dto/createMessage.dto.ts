import {IsInt, IsString} from "class-validator";

export class CreateMessageDto {
    @IsInt()
    id: number;

    @IsString()
    senderUsername: string;

    @IsString()
    content: string;

    @IsInt()
    feeling: number;
}