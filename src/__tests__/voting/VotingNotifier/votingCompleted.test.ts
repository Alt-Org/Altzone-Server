import VotingBuilderFactory from '../data/voting/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import mqtt from 'mqtt';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import createMockMqttClient from '../../common/service/notificator/mocks/createMockMqttClient';

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
    const votingDto = votingBuilder.build();
    const fleaMarketItem = fleaMarketBuilder.build();
    const expectedTopic = `/${NotificationGroup.CLAN}/${votingDto.organizer.clan_id}/${NotificationResource.VOTING}/${votingDto.type}/${NotificationStatus.END}`;
    const expectedPayload = JSON.stringify({
      topic: `/clan/${votingDto.organizer.clan_id}/voting/${votingDto._id.toString()}`,
      status: NotificationStatus.END,
      voting_id: votingDto._id.toString(),
      type: votingDto.type,
      entity: fleaMarketItem,
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
