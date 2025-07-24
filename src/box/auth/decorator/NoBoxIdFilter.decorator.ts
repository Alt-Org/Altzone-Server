import { SetMetadata } from '@nestjs/common';

export const NO_BOX_ID_FILTER = 'NO_BOX_ID_FILTER';

export const NoBoxIdFilter = () => SetMetadata(NO_BOX_ID_FILTER, true);
