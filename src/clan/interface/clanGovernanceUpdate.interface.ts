// src/clan/interface/clanGovernanceUpdate.interface.ts

import { CreateClanRoleDto } from '../role/dto/createClanRole.dto';

/**
 * Interface defining the shape of governance-related updates.
 * Moved from DTO to keep the input contract clean.
 */
export interface ClanGovernanceUpdate {
  roles?: CreateClanRoleDto[];
  admin_ids?: string[];
}