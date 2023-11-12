import {Expose} from "class-transformer";

export class MessageDto {
    @Expose()
    id: number;

    @Expose()
    senderUsername: string;

    @Expose()
    content: string;

    @Expose()
    feeling: number;
}