import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import mqtt from 'mqtt';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import TestUtilDataFactory from '../../test_utils/data/TestUtilsDataFactory';
import createMockMqttClient from '../../common/service/notificator/mocks/createMockMqttClient';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingNotifier.votingError() test suite', () => {
  let votingNotifier: VotingNotifier;

  beforeEach(async () => {
    votingNotifier = await VotingModule.getVotingNotifier();
  });

  it('Should send a notification for a voting error if input is valid', async () => {
    const organizer = VotingBuilderFactory.getBuilder('Organizer')
      .setClanId('clanId')
      .build();
    const apiError = TestUtilDataFactory.getBuilder('APIError').build();

    const expectedTopic = `/${NotificationGroup.CLAN}/${organizer.clan_id}/${NotificationResource.VOTING}/${VotingType.FLEA_MARKET_SELL_ITEM}/${NotificationStatus.ERROR}`;
    const expectedPayload = JSON.stringify(apiError);

    const { publishAsyncMock } = createMockMqttClient();
    await votingNotifier.votingError(
      organizer.clan_id,
      VotingType.FLEA_MARKET_SELL_ITEM,
      apiError,
    );

    expect(mqtt.connect).toHaveBeenCalledTimes(1);
    expect(publishAsyncMock).toHaveBeenCalledWith(
      expectedTopic,
      expectedPayload,
    );
  });
});
