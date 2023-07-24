import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {CASLAbilityFactory} from "./caslAbility.factory";
import {HAS_PERMISSION} from "./decorator/HasPermission.decorator";
import {User} from "../auth/user";
import {PermissionChecker} from "./type/PermissionChecker.type";
import {Profile} from "../profile/profile.schema";
import {Action} from "./enum/action.enum";

@Injectable()
export class PermissionGuard implements CanActivate{
    constructor(
        private readonly reflector: Reflector,
        private readonly caslAbilityFactory: CASLAbilityFactory
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permissionCheckers = this.reflector.get<PermissionChecker[]>(
            HAS_PERMISSION,
            context.getHandler()
        );

        if(!permissionCheckers || permissionCheckers.length === 0)
            return true;

        const { user } = context.switchToHttp().getRequest();
        if(!user || !(user instanceof User))
            return false;

        const userAbility = this.caslAbilityFactory.createForUser(user, Profile);

        const prof = new Profile();
        userAbility.can(Action.read_response, prof)

        console.log(user);
        console.log(userAbility.can(Action.read_response, Profile));

        return permissionCheckers.every(
            (checker) => checker(userAbility)
        );
    }
}