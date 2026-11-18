import { Box } from '../schemas/box.schema';
import { PackageRace } from './packageRace.schema';
import { SEReason } from '../../common/service/basicService/SEReason';
import ServiceError from '../../common/service/basicService/ServiceError';

export type BoxWithRace = Pick<
  Box,
  '_id' | 'sessionStage' | 'sessionResetTime' | 'createdClan_ids'
> & { packageRace: PackageRace };

/**
 * Checks if the only present ServiceError is NOT_FOUND.
 *
 * @param errors array of ServiceErrors.
 * @returns boolean: true if the only error is NOT_FOUND, false if any other error(s) are present.
 */
export function isOnlyNotFound(errors: ServiceError[]) {
  return errors.every((e) => e.reason === SEReason.NOT_FOUND);
}
