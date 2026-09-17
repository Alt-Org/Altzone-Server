import ClanModule from '../modules/clan.module';
import ClanHelperService from '../../../clan/utils/clanHelper.service';
import { ClanRule } from '../../../clan/enum/clanRule.enum';

describe('ClanHelperService.ensureMandatoryRules() test suite', () => {
  let clanHelperService: ClanHelperService;

  const mandatoryRules = [
    ClanRule.FAIR_GAME,
    ClanRule.NO_TOXICITY,
    ClanRule.NO_SPAM,
  ];

  beforeEach(async () => {
    clanHelperService = await ClanModule.getClanHelperService();
  });

  it('Should add all mandatory rules to an empty rules list', () => {
    const rules: ClanRule[] = [];

    clanHelperService.ensureMandatoryRules(rules);

    expect(rules).toEqual(mandatoryRules);
  });

  it('Should keep the chosen rules and append the mandatory rules after them', () => {
    const rules = [ClanRule.TEAMWORK, ClanRule.POSITIVITY];

    clanHelperService.ensureMandatoryRules(rules);

    expect(rules).toEqual([
      ClanRule.TEAMWORK,
      ClanRule.POSITIVITY,
      ...mandatoryRules,
    ]);
  });

  it('Should not change the rules list if all mandatory rules are already present', () => {
    const rules = [
      ClanRule.NO_SPAM,
      ClanRule.TEAMWORK,
      ClanRule.FAIR_GAME,
      ClanRule.NO_TOXICITY,
    ];

    clanHelperService.ensureMandatoryRules(rules);

    expect(rules).toEqual([
      ClanRule.NO_SPAM,
      ClanRule.TEAMWORK,
      ClanRule.FAIR_GAME,
      ClanRule.NO_TOXICITY,
    ]);
  });

  it('Should add only the missing mandatory rules without duplicating the present ones', () => {
    const rules = [ClanRule.NO_TOXICITY, ClanRule.ACTIVITY_DAILY];

    clanHelperService.ensureMandatoryRules(rules);

    expect(rules).toEqual([
      ClanRule.NO_TOXICITY,
      ClanRule.ACTIVITY_DAILY,
      ClanRule.FAIR_GAME,
      ClanRule.NO_SPAM,
    ]);
  });

  it('Should modify the given array in place', () => {
    const body = { rules: [ClanRule.TEAMWORK] };
    const updateData = { ...body };

    clanHelperService.ensureMandatoryRules(updateData.rules);

    expect(updateData.rules).toBe(body.rules);
    expect(body.rules).toEqual([ClanRule.TEAMWORK, ...mandatoryRules]);
  });
});
