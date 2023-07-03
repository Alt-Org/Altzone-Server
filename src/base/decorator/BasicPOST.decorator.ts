import {applyDecorators} from '@nestjs/common';
import {CatchCreateUpdateErrors} from "../../decorator/CatchCreateUpdateErrors";

export function BasicPOST() {
    return applyDecorators(
        CatchCreateUpdateErrors()
    );
}