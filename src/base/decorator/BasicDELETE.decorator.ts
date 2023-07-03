import {applyDecorators, HttpCode} from '@nestjs/common';
import {BeautifyResponse} from "../../decorator/BeautifyResponse";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export function BasicDELETE(modelName: ClassName) {
    return applyDecorators(
        HttpCode(204),
        BeautifyResponse(ResponseType.DELETE, modelName)
    );
}