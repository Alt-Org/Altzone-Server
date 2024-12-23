import {Global, Module} from '@nestjs/common';
import {CASLAbilityFactory} from "./caslAbility.factory";
import {RequestHelperModule} from "../requestHelper/requestHelper.module";
import {AuthorizationInterceptor} from "./authorization.interceptor";

@Global()
@Module({
    imports: [RequestHelperModule],
    providers: [CASLAbilityFactory, AuthorizationInterceptor],
    exports: [CASLAbilityFactory]
})
export class AuthorizationModule {}
