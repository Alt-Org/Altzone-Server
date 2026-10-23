import VotingBuilderFactory from '../data/voting/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import mqtt from 'mqtt';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';
import { MqttNotificationType } from '../../../common/service/notificator/enum/MqttNotificationType.enum';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import createMockMqttClient from '../../common/service/notificator/mocks/createMockMqttClient';
import { VoteChoice } from '../../../voting/enum/choiceType.enum';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingNotifier.votingCompleted() test suite', () => {
  let votingNotifier: VotingNotifier;

  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const fleaMarketBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');

  beforeEach(async () => {
    votingNotifier = await VotingModule.getVotingNotifier();
  });

  it('should send a notification for a completed voting if input is valid', async () => {
    const votes = [
      {
        player_id: '6630aa9994cd5ef001a1b1c2',
        choice: VoteChoice.YES,
      },
      {
        player_id: '6630aa9994cd5ef001a1b1c3',
        choice: VoteChoice.NO,
      },
    ];
    const votingDto = votingBuilder.setVotes(votes).build();
    const fleaMarketItem = fleaMarketBuilder.build();
    const expectedTopic = `/${NotificationGroup.CLAN}/${votingDto.organizer.clan_id}/${NotificationResource.VOTING}/${votingDto.type}/${NotificationStatus.END}`;
    const expectedPayload = JSON.stringify({
      topic: 'voting',
      type: MqttNotificationType.VOTING_ENDED,
      payload: {
        topic: `/clan/${votingDto.organizer.clan_id}/voting/${votingDto._id.toString()}`,
        status: NotificationStatus.END,
        voting_id: votingDto._id.toString(),
        type: votingDto.type,
        entity: fleaMarketItem,
        startedAt: votingDto.startedAt,
        endedAt: votingDto.endedAt,
        votes: votingDto.votes,
      },
    });

    const { publishAsyncMock } = createMockMqttClient();
    await votingNotifier.votingCompleted(votingDto, fleaMarketItem);

    expect(mqtt.connect).toHaveBeenCalledTimes(1);
    expect(publishAsyncMock).toHaveBeenCalledWith(
      expectedTopic,
      expectedPayload,
    );
  });

  it('Should throw an error if voting input is invalid', async () => {
    const invalidVotingDto = votingBuilder.setOrganizer(null).build();
    const fleaMarketItem = fleaMarketBuilder.build();

    createMockMqttClient('topic', 'payload');
    await expect(
      votingNotifier.votingCompleted(invalidVotingDto, fleaMarketItem),
    ).rejects.toThrow("Cannot read properties of null (reading 'clan_id')");
  });
});
