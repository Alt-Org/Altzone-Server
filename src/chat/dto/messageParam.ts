import {IsInt, IsMongoId} from "class-validator";

export class messageParam {
    @IsMongoId()
    chat_id: string;

    @IsInt()
    _id: number;
}

export class chat_idParam {
    @IsMongoId()
    chat_id: string;
}