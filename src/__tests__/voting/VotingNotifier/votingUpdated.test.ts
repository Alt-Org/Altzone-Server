import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import { PlayerDto } from '../../../player/dto/player.dto';
import mqtt from 'mqtt';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import createMockMqttClient from '../../common/service/notificator/mocks/createMockMqttClient';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingNotifier.votingUpdated() test suite', () => {
  let votingNotifier: VotingNotifier;
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const fleaMarketBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');
  const playerBuilder = PlayerBuilderFactory.getBuilder('PlayerDto');

  beforeEach(async () => {
    votingNotifier = await VotingModule.getVotingNotifier();
  });

  it('Should send a notification for a voting update if input is valid', async () => {
    const votingDto = votingBuilder.build();
    const fleaMarketItem = fleaMarketBuilder.build();
    const playerDto = playerBuilder.build();
    const expectedTopic = `/${NotificationGroup.CLAN}/${votingDto.organizer.clan_id}/${NotificationResource.VOTING}/${votingDto.type}/${NotificationStatus.UPDATE}`;
    const expectedPayload = JSON.stringify({
      topic: `/clan/${votingDto.organizer.clan_id}/voting/${votingDto._id.toString()}`,
      status: NotificationStatus.UPDATE,
      voting_id: votingDto._id.toString(),
      type: votingDto.type,
      entity: fleaMarketItem,
      voter: playerDto as PlayerDto,
    });

    const { publishAsyncMock } = createMockMqttClient();

    await votingNotifier.votingUpdated(votingDto, fleaMarketItem, playerDto);

    expect(mqtt.connect).toHaveBeenCalledTimes(1);
    expect(publishAsyncMock).toHaveBeenCalledWith(
      expectedTopic,
      expectedPayload,
    );
  });

  it('Should throw an error if voting input is invalid', async () => {
    const invalidVotingDto = votingBuilder.setOrganizer(null).build();
    const fleaMarketItem = fleaMarketBuilder.build();
    const playerDto = playerBuilder.build();

    createMockMqttClient('topic', 'payload');

    await expect(
      votingNotifier.votingUpdated(invalidVotingDto, fleaMarketItem, playerDto),
    ).rejects.toThrow("Cannot read properties of null (reading 'clan_id')");
  });
});
