import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import { PlayerDto } from '../../../player/dto/player.dto';
import mqtt, { MqttClient } from 'mqtt';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../..//common/service/notificator/enum/NotificationResource.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingNotifier.newVoting() test suite', () => {
  let votingNotifier: VotingNotifier;
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');

  const votingModel = VotingModule.getVotingModel();

  beforeEach(async () => {
    votingNotifier = await VotingModule.getVotingNotifier();
  });

  it('Should send a notification for a new voting if input is valid', async () => {
    const votingDto = votingBuilder.build();

    const fleaMarketItem =
      FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto').build();

    const playerDto = PlayerBuilderFactory.getBuilder('PlayerDto').build();

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

    await votingNotifier.newVoting(votingDto, fleaMarketItem, playerDto);

    expect(mqtt.connect).toHaveBeenCalledTimes(1);

    expect(mockReturnValue.mock.calls[0][0]).toEqual(
      `/${NotificationGroup.CLAN}/${votingDto.organizer.clan_id}/${
        NotificationResource.VOTING
      }/${votingDto.type}/${NotificationStatus.NEW}`,
    );

    expect(mockReturnValue.mock.calls[0][1]).toEqual(
      JSON.stringify({
        topic: `/clan/${
          votingDto.organizer.clan_id
        }/voting/${votingDto._id.toString()}`,
        status: NotificationStatus.NEW,
        voting_id: votingDto._id.toString(),
        type: votingDto.type,
        item: fleaMarketItem,
        organizer: playerDto as PlayerDto,
      }),
    );
  });

  it('Should return with an error if input is invalid', async () => {
    const votingDto = votingBuilder.setOrganizer(null).build(); //add error to the input

    const fleaMarketItem =
      FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto').build();

    const playerDto = PlayerBuilderFactory.getBuilder('PlayerDto').build();

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

    try {
      await votingNotifier.newVoting(votingDto, fleaMarketItem, playerDto);
    } catch (error) {
      expect(error).toEqual(
        new TypeError("Cannot read properties of null (reading 'clan_id')"),
      );
    }
  });
});
