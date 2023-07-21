import {SetMetadata} from "@nestjs/common";

export const NO_AUTH_REQUIRED = 'noAuthRequired';
export const NoAuth = () => {
    return SetMetadata(NO_AUTH_REQUIRED, true);
}