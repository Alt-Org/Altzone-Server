import {applyDecorators, HttpCode} from '@nestjs/common';
import {CatchCreateUpdateErrors} from "../../decorator/CatchCreateUpdateErrors";
import {BeautifyResponse} from "../../decorator/BeautifyResponse";
import {ResponseType} from "../../decorator/responseType";
import {ClassName} from "../../util/dictionary";

export function BasicPUT(modelName: ClassName) {
    return applyDecorators(
        HttpCode(204),
        CatchCreateUpdateErrors(),
        BeautifyResponse(ResponseType.UPDATE, modelName)
    );
}