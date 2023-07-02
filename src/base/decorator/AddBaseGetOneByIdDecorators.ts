import {applyDecorators, Get} from '@nestjs/common';
import {BeautifyResponse} from "../../decorator/BeautifyResponse";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export function AddBaseGetOneByIdDecorators(modelName: ClassName) {
    return applyDecorators(
        Get('/:_id'),
        BeautifyResponse(ResponseType.READ, modelName)
    );
}