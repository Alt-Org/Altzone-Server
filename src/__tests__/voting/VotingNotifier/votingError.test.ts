import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import mqtt, { MqttClient } from 'mqtt';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import { Organizer } from '../../../voting/dto/organizer.dto';
import TestUtilDataFactory from '../../test_utils/data/TestUtilsDataFactory';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingNotifier.votingError() test suite', () => {
  let votingNotifier: VotingNotifier;
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');

  beforeEach(async () => {
    votingNotifier = await VotingModule.getVotingNotifier();
  });

  it('Should send a notification for a voting error if input is valid', async () => {
    const organizer = VotingBuilderFactory.getBuilder('Organizer')
      .setClanId('clanId')
      .build() as Organizer;

    const votingDto = votingBuilder.setOrganizer(organizer).build();

    const apiError = TestUtilDataFactory.getBuilder('APIError').build();

    const mockClient = {};

    (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

    const mockReturnValue = ((mockClient as MqttClient).publishAsync = jest.fn(
      (topic, payload) => {
        return Promise.resolve({
          cmd: 'publish',
          qos: 0,
          dup: false,
          retain: false,
          topic,
          payload,
        });
      },
    ));

    await votingNotifier.votingError(
      organizer.clan_id,
      VotingType.SELLING_ITEM,
      apiError,
    );

    expect(mqtt.connect).toHaveBeenCalledTimes(1);

    expect(mockReturnValue.mock.calls[0][0]).toEqual(
      `/${NotificationGroup.CLAN}/${votingDto.organizer.clan_id}/${
        NotificationResource.VOTING
      }/${votingDto.type}/${NotificationStatus.ERROR}`,
    );

    expect(mockReturnValue.mock.calls[0][1]).toEqual(
      JSON.stringify({
        response: apiError.getResponse(),
        status: apiError.getStatus(),
        message: apiError.message,
        name: apiError.name,
        reason: apiError.reason,
        field: apiError.field,
        value: apiError.value,
        additional: apiError.additional,
        statusCode: apiError.statusCode,
        objectType: 'APIError',
      }),
    );
  });
});
