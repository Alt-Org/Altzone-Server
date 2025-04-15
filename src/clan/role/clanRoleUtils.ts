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
export function doesRoleWithRightsExists(
  clanRoles: ClanRole[],
  roleRights: Partial<Record<ClanBasicRight, true>>,
): boolean {
  if (!clanRoles || clanRoles.length === 0 || !roleRights) return false;

  return clanRoles.some((role) => areRightsEqual(role.rights, roleRights));
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

/**
 * Compares role rights objects
 * @param first first rights object to compare
 * @param second second righst object to compare
 *
 * @returns true if the objects has the same rights or false if not
 */
function areRightsEqual(
  first: Partial<Record<ClanBasicRight, true>>,
  second: Partial<Record<ClanBasicRight, true>>,
): boolean {
  const firstRights = first ?? {};
  const secondRights = second ?? {};

  const firstKeys = Object.keys(firstRights);
  const secondKeys = Object.keys(secondRights);

  if (firstKeys.length !== secondKeys.length) return false;

  return firstKeys.every((key) => second[key as ClanBasicRight] === true);
}
