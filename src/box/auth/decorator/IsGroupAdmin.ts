import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { GroupAdminGuard } from './groupAdmin.guard';
import { v2GroupAdminGuard } from './group-admin.v2.guard';

export const IS_GROUP_ADMIN = Symbol('isGroupAdmin');

/**
 * Checks whenever the logged-in user is a group admin and throws error if not
 */
export function IsGroupAdmin() {
  return applyDecorators(
    SetMetadata(IS_GROUP_ADMIN, true),
    UseGuards(GroupAdminGuard),
  );
}

export function v2IsGroupAdmin() {
  return applyDecorators(
    SetMetadata(IS_GROUP_ADMIN, true),
    UseGuards(v2GroupAdminGuard),
  );
}
