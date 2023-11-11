import {Expose} from "class-transformer";

export class MessageDto {
    @Expose()
    _id: string;

    @Expose()
    senderUsername: string;

    @Expose()
    content: string;

    @Expose()
    feeling: number;
}