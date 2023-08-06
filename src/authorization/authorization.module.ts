import {Global, Module} from '@nestjs/common';
import {CASLAbilityFactory} from "./caslAbility.factory";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {AuthorizationInterceptor} from "./authorization.interceptor";
import {ApiStateModule} from "../common/apiState/apiState.module";

@Global()
@Module({
    imports: [RequestHelperModule, ApiStateModule],
    providers: [CASLAbilityFactory, AuthorizationInterceptor],
    exports: [CASLAbilityFactory]
})
export class AuthorizationModule {}
