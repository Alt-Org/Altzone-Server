import {IsInt, IsMongoId} from "class-validator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('messageParam')
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