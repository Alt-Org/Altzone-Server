import { SetMetadata } from '@nestjs/common';
import { PermissionChecker } from '../type/PermissionChecker.type';

export const HAS_PERMISSION = 'has_permission';
export const HasPermission = (...checkers: PermissionChecker[]) => {
  return SetMetadata(HAS_PERMISSION, checkers);
};
