import {CheckPermissions, PermissionMetaData} from "../authorization.interceptor";
import {applyDecorators} from "@nestjs/common";
import {SetAuthorizationFor} from "./SetAuthorizationFor";

export function Authorize(metaData: PermissionMetaData) {
    return applyDecorators(
        SetAuthorizationFor(metaData),
        CheckPermissions()
    );
}