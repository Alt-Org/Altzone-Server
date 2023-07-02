import {applyDecorators, Delete, HttpCode, Post} from '@nestjs/common';
import {BeautifyResponse} from "../../decorator/BeautifyResponse";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export function AddBaseDeleteOneByIdDecorators(modelName: ClassName) {
    return applyDecorators(
        Delete('/:_id'),
        HttpCode(204),
        BeautifyResponse(ResponseType.DELETE, modelName)
    );
}