import {Global, Module} from '@nestjs/common';
import {CASLAbilityFactory} from "./caslAbility.factory";
import {PermissionGuard} from "./permissionGuard.guard";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {AuthorizationInterceptor} from "./authorization.interceptor";

@Global()
@Module({
    imports: [RequestHelperModule],
    providers: [PermissionGuard, CASLAbilityFactory, AuthorizationInterceptor],
    exports: [PermissionGuard, CASLAbilityFactory]
})
export class AuthorizationModule {}
