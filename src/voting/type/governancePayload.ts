import { CreateClanRoleDto } from '../../clan/role/dto/createClanRole.dto';

export class GovernancePayload {
  roles?: CreateClanRoleDto[];
  admin_idsToAdd?: string[];
  admin_idsToDelete?: string[];
}