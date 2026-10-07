import {
  BOX_SESSION_MAX_MEMBERS_PER_CLAN,
  BOX_SESSION_MAX_PARTICIPANTS,
  BOX_SESSION_MIN_PARTICIPANTS,
  BOX_SESSION_POINTS_PER_MEMBER,
} from '../consts/boxSessionConstants';

export type BoxClanPlan = {
  memberLimit: number;
  targetPoints: number;
};

/**
 * Creates deterministic plans for the two clans in a Box session.
 * The first clan receives the extra member when the participant count is odd.
 */
export function createBoxClanPlans(
  participants: number,
): [BoxClanPlan, BoxClanPlan] {
  if (
    !Number.isInteger(participants) ||
    participants < BOX_SESSION_MIN_PARTICIPANTS ||
    participants > BOX_SESSION_MAX_PARTICIPANTS
  ) {
    throw new RangeError(
      `participants must be an integer between ${BOX_SESSION_MIN_PARTICIPANTS} and ${BOX_SESSION_MAX_PARTICIPANTS}`,
    );
  }

  const memberLimits = [
    Math.ceil(participants / 2),
    Math.floor(participants / 2),
  ] as const;

  if (
    memberLimits.some(
      (memberLimit) => memberLimit > BOX_SESSION_MAX_MEMBERS_PER_CLAN,
    )
  ) {
    throw new RangeError(
      `A Box session clan cannot exceed ${BOX_SESSION_MAX_MEMBERS_PER_CLAN} members`,
    );
  }

  return memberLimits.map((memberLimit) => ({
    memberLimit,
    targetPoints: memberLimit * BOX_SESSION_POINTS_PER_MEMBER,
  })) as [BoxClanPlan, BoxClanPlan];
}
