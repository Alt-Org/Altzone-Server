import {IsMongoId, IsString} from "class-validator";

export class messageParam {
    @IsMongoId()
    chat_id: string;

    @IsString()
    _id: string;
}

export class chat_idParam {
    @IsMongoId()
    chat_id: string;
}