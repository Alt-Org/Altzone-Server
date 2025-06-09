import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import createMockMqttClient from '../../common/service/notificator/mocks/createMockMqttClient';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingNotifier.newVoting() test suite', () => {
  let votingNotifier: VotingNotifier;

  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const fleaMarketBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');
  const playerBuilder = PlayerBuilderFactory.getBuilder('PlayerDto');

  beforeEach(async () => {
    votingNotifier = await VotingModule.getVotingNotifier();
  });

  it('Should send a notification for a valid new voting', async () => {
    const votingDto = votingBuilder.build();
    const fleaMarketItem = fleaMarketBuilder.build();
    const playerDto = playerBuilder.build();
    const expectedTopic = `/${NotificationGroup.CLAN}/${votingDto.organizer.clan_id}/${NotificationResource.VOTING}/${votingDto.type}/${NotificationStatus.NEW}`;
    const expectedPayload = JSON.stringify({
      topic: `/clan/${votingDto.organizer.clan_id}/voting/${votingDto._id.toString()}`,
      status: NotificationStatus.NEW,
      voting_id: votingDto._id.toString(),
      type: votingDto.type,
      entity: fleaMarketItem,
      organizer: playerDto,
    });

    const { publishAsyncMock } = createMockMqttClient();
    await votingNotifier.newVoting(votingDto, fleaMarketItem, playerDto);

    expect(publishAsyncMock).toHaveBeenCalledWith(
      expectedTopic,
      expectedPayload,
    );
  });

  it('Should throw an error if voting input is invalid', async () => {
    const invalidVotingDto = votingBuilder.setOrganizer(null).build();
    const fleaMarketItem = fleaMarketBuilder.build();
    const playerDto = playerBuilder.build();

    await expect(
      votingNotifier.newVoting(invalidVotingDto, fleaMarketItem, playerDto),
    ).rejects.toThrow("Cannot read properties of null (reading 'clan_id')");
  });
});
