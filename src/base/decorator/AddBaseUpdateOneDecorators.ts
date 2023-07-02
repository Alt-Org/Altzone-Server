import {applyDecorators, HttpCode, Put} from '@nestjs/common';
import {CatchCreateUpdateErrors} from "../../decorator/CatchCreateUpdateErrors";
import {BeautifyResponse} from "../../decorator/BeautifyResponse";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export function AddBaseUpdateOneDecorators(modelName: ClassName) {
    return applyDecorators(
        Put(),
        HttpCode(204),
        CatchCreateUpdateErrors(),
        BeautifyResponse(ResponseType.UPDATE, modelName)
    );
}