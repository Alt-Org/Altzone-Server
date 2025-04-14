import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import { FleaMarketItemDto } from '../../../fleaMarket/dto/fleaMarketItem.dto';
import { PlayerDto } from '../../../player/dto/player.dto';
import mqtt, { MqttClient } from 'mqtt';
import { NotificationStatus } from '../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationGroup } from '../../../common/service/notificator/enum/NotificationGroup.enum';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingNotifier.votingCompleted() test suite', () => {
  let votingNotifier: VotingNotifier;
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');

  beforeEach(async () => {
    votingNotifier = await VotingModule.getVotingNotifier();
  });

  it('Should send a notification for a completed voting if input is valid', async () => {
    const votingDto = votingBuilder.build();

    const fleaMarketItem = VotingBuilderFactory.getBuilder(
      'FleaMarketItemDto',
    ).build() as FleaMarketItemDto;

    const playerDto = VotingBuilderFactory.getBuilder(
      'CreatePlayerDto',
    ).build() as PlayerDto;

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

    await votingNotifier.votingCompleted(votingDto, fleaMarketItem);

    expect(mqtt.connect).toHaveBeenCalledTimes(1);

    expect(mockReturnValue.mock.calls[0][0]).toEqual(
      `/${NotificationGroup.CLAN}/${votingDto.organizer.clan_id}/${
        NotificationResource.VOTING
      }/${votingDto.type}/${NotificationStatus.END}`,
    );

    expect(mockReturnValue.mock.calls[0][1]).toEqual(
      JSON.stringify({
        topic: `/clan/${
          votingDto.organizer.clan_id
        }/voting/${votingDto._id.toString()}`,
        status: NotificationStatus.END,
        voting_id: votingDto._id.toString(),
        type: votingDto.type,
        item: fleaMarketItem,
      }),
    );
  });

  it('Should return with an error if input is invalid', async () => {
    const votingDto = votingBuilder.setOrganizer(null).build(); //add error to the input

    const fleaMarketItem = VotingBuilderFactory.getBuilder(
      'FleaMarketItemDto',
    ).build() as FleaMarketItemDto;

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
      await votingNotifier.votingCompleted(votingDto, fleaMarketItem);
    } catch (error) {
      expect(error).toEqual(
        new TypeError("Cannot read properties of null (reading 'clan_id')"),
      );
    }
  });
});
