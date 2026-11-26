import { Box } from '../schemas/box.schema';
import { PackageRace } from './packageRace.schema';
import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export type BoxWithRace = Pick<Box, '_id'> & { packageRace: PackageRace };

/**
 * Checks if the only present ServiceError is NOT_FOUND.
 *
 * @param errors array of ServiceErrors.
 * @returns boolean: true if the only error is NOT_FOUND, false if any other error(s) are present.
 */
export function isOnlyNotFound(errors: ServiceError[]) {
  return errors.every((e) => e.reason === SEReason.NOT_FOUND);
}

/**
 * Returns ServiceError NOT_FOUND when package race cannot be found.
 *
 * @param teamId _id of specified package race team
 * @param boxId _id of specified box
 * @returns ServiceError NOT_FOUND
 */
export function teamNotInBoxError(teamId: string, boxId: string) {
  return new ServiceError({
    reason: SEReason.NOT_FOUND,
    field: 'team_id',
    value: teamId,
    message: `Package race team is not found in box ${boxId}`,
  });
}
