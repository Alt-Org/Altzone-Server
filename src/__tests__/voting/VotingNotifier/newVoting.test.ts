import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import VotingNotifier from '../../../voting/voting.notifier';
import { FleaMarketItemDto } from '../../../fleaMarket/dto/fleaMarketItem.dto';
import { PlayerDto } from '../../../player/dto/player.dto';
import mqtt, { MqttClient } from 'mqtt';

jest.mock('mqtt', () => ({
  connect: jest.fn()
}));

describe('VotingNotifier.newVoting() test suite', () => {
  let votingNotifier: VotingNotifier;
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');

  const votingModel = VotingModule.getVotingModel();

  beforeEach(async () => {
    votingNotifier = await VotingModule.getVotingNotifier();
  });

  it('Should create a voting in DB if input is valid', async () => {

    const votingDto = votingBuilder
      .setEndsOn(new Date(Date.now() + 1000 * 60 * 60 * 24))
      .build();

      const fleaMarketItem = VotingBuilderFactory.getBuilder('FleaMarketItemDto')
          .build() as FleaMarketItemDto;

      const player = VotingBuilderFactory.getBuilder('CreatePlayerDtoBuilder').build() as PlayerDto;
      
      const mockClient = { };
      
      (mqtt.connect as jest.Mock).mockReturnValue(mockClient);
      const mockReturnValue = (mockClient as MqttClient).publishAsync = jest.fn((topic, payload) => {
        return Promise.resolve({
          cmd: 'publish',
          qos: 0,
          dup: false,
          retain: false,
          topic,
          payload,
        });
      });

      await votingNotifier.newVoting(votingDto, fleaMarketItem, player);

      expect(mqtt.connect).toHaveBeenCalledTimes(1);

      expect(mockReturnValue).toHaveBeenCalledTimes(1);
  }); 
});
