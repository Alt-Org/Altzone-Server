import {applyDecorators} from '@nestjs/common';
import {BeautifyResponse} from "../../decorator/BeautifyResponse";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export const BasicGET = (modelName: ClassName) => {
    return applyDecorators(
        BeautifyResponse(ResponseType.READ, modelName)
    );
}