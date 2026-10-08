import { createBoxClanPlans } from '../../../box/util/createBoxClanPlans';
import {
  BOX_SESSION_MAX_PARTICIPANTS,
  BOX_SESSION_MIN_PARTICIPANTS,
  BOX_SESSION_POINTS_PER_MEMBER,
} from '../../../box/consts/boxSessionConstants';

describe('createBoxClanPlans()', () => {
  it('splits an even participant count equally', () => {
    expect(createBoxClanPlans(20)).toEqual([
      { memberLimit: 10, targetPoints: 4200 },
      { memberLimit: 10, targetPoints: 4200 },
    ]);
  });

  it('assigns the extra member to the first clan for an odd count', () => {
    expect(createBoxClanPlans(29)).toEqual([
      { memberLimit: 15, targetPoints: 6300 },
      { memberLimit: 14, targetPoints: 5880 },
    ]);
  });

  it('supports the maximum participant count', () => {
    const plans = createBoxClanPlans(BOX_SESSION_MAX_PARTICIPANTS);

    expect(plans).toEqual([
      {
        memberLimit: 15,
        targetPoints: 15 * BOX_SESSION_POINTS_PER_MEMBER,
      },
      {
        memberLimit: 15,
        targetPoints: 15 * BOX_SESSION_POINTS_PER_MEMBER,
      },
    ]);
  });

  it('supports the minimum participant count', () => {
    expect(createBoxClanPlans(BOX_SESSION_MIN_PARTICIPANTS)).toEqual([
      { memberLimit: 1, targetPoints: BOX_SESSION_POINTS_PER_MEMBER },
      { memberLimit: 0, targetPoints: 0 },
    ]);
  });

  it.each([
    BOX_SESSION_MIN_PARTICIPANTS - 1,
    BOX_SESSION_MAX_PARTICIPANTS + 1,
    1.5,
  ])('rejects an invalid participant count of %s', (participants) => {
    expect(() => createBoxClanPlans(participants)).toThrow(RangeError);
  });
});
