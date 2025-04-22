import { AppAbility } from '../caslAbility.factory';

export type PermissionChecker = (ability: AppAbility) => boolean;
