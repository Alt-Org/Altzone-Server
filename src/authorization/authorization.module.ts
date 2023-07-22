import { Module } from '@nestjs/common';
import {CASLAbilityFactory} from "./casl-ability.factory/casl-ability.factory";

@Module({
    providers: [CASLAbilityFactory],
    exports: [CASLAbilityFactory]
})
export class AuthorizationModule {}
