import {applyDecorators, HttpCode} from '@nestjs/common';
import {ThrowResponseErrorIfFound} from "../../decorator/ThrowResponseErrorIfFound";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export function BasicDELETE(modelName: ClassName) {
    return applyDecorators(
        HttpCode(204),
        ThrowResponseErrorIfFound(ResponseType.DELETE, modelName)
    );
}