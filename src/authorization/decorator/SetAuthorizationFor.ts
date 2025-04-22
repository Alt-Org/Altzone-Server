import { SetMetadata } from '@nestjs/common';
import { PermissionMetaData } from '../authorization.interceptor';

export const PERMISSION_METADATA = 'permission_metadata';
export const SetAuthorizationFor = (metaData: PermissionMetaData) => {
  return SetMetadata(PERMISSION_METADATA, metaData);
};
