import {applyDecorators, Get} from '@nestjs/common';
import {BeautifyResponse} from "../../decorator/BeautifyResponse";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export function AddBaseGetAllDecorators(modelName: ClassName) {
    return applyDecorators(
        Get(),
        BeautifyResponse(ResponseType.READ, modelName)
    );
}