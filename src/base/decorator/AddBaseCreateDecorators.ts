import {applyDecorators, Post} from '@nestjs/common';
import {CatchCreateUpdateErrors} from "../../decorator/CatchCreateUpdateErrors";

export function AddBaseCreateDecorators() {
    return applyDecorators(
        Post(),
        CatchCreateUpdateErrors()
    );
}