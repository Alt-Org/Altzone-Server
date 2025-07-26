import { SetMetadata } from '@nestjs/common';

export const NO_BOX_ID_FILTER = 'NO_BOX_ID_FILTER';

/**
 * Used for skipping the BoxIdFilter interceptor.
 * Used in testing session related endpoints that need to be able to return
 * entities from DB that don't match the requesting users box_id
 * of for endpoints before the user is authenticated.
 */
export const NoBoxIdFilter = () => SetMetadata(NO_BOX_ID_FILTER, true);
