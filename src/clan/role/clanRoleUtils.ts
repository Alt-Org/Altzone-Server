import { ClanRole } from './ClanRole.schema';
import { ClanBasicRight } from './enum/clanBasicRight.enum';

/**
 * Determines whenever there are a role with exact same rights.
 *
 * @param clanRoles clan roles where to search
 * @param roleRights rights of the role
 *
 * @returns true if there are a role with exact same rights or false if not
 */
export function isRoleDuplicate(
  clanRoles: ClanRole[],
  roleRights: Partial<Record<ClanBasicRight, true>>,
): boolean {
  if (!clanRoles || clanRoles.length === 0 || !roleRights) return false;

  return clanRoles.findIndex((role) => role.rights === roleRights) !== -1;
}

/**
 * Determines whenever there are a role with the proved name
 * @param clanRoles clan roles where to search
 * @param roleName name of the role
 *
 * @returns true if there are a role with the name or false if not
 */
export function isRoleNameExists(
  clanRoles: ClanRole[],
  roleName: string,
): boolean {
  if (!clanRoles || clanRoles.length === 0 || !roleName) return false;

  return clanRoles.findIndex((role) => role.name === roleName) !== -1;
}
