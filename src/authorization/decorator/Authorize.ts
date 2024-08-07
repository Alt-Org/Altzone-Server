import {CheckPermissions, PermissionMetaData} from "../authorization.interceptor";
import {applyDecorators} from "@nestjs/common";
import {SetAuthorizationFor} from "./SetAuthorizationFor";

/**
 * Set the authorization rules for the endpoint. If logged-in user is not allowed to make the action 403 will be returned.
 *
 * Notice that if the user is not allowed to perform an action the code in controller method will not called.
 * 
 * Authorization is based on the subject (or resource) for witch the action is performed
 * and action itself or what is trying to be done
 *
 * For example clan (subject) + create (action) = logged-in user is trying to create a new clan.
 * Based on defined authorization rules this action can be allowed or not. All authorization rules can be found from /src/authorization/rule
 * @param metaData 
 * @returns 
 */
export function Authorize(metaData: PermissionMetaData) {
    return applyDecorators(
        SetAuthorizationFor(metaData),
        CheckPermissions()
    );
}