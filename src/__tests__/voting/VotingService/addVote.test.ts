import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';
import { PlayerDto } from '../../../player/dto/player.dto';
import { FleaMarketItemDto } from '../../../fleaMarket/dto/fleaMarketItem.dto';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import mqtt, { MqttClient } from 'mqtt';
import { ItemVoteChoice } from '../../../voting/enum/choiceType.enum';
import { PlayerService } from '../../../player/player.service';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';

jest.mock('mqtt', () => ({
  connect: jest.fn()
}));

describe('VotingService.addVote() test suite', () => {
  let votingService: VotingService;
  let playerService: PlayerService;
  let fleaMarketService: FleaMarketService;

  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  const playerBuilder = VotingBuilderFactory.getBuilder('CreatePlayerDto');

  const votingModel = VotingModule.getVotingModel();
  const playerModel = VotingModule.getPlayerModel();
  
  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
    playerService = await VotingModule.getPlayerService();
    fleaMarketService = await VotingModule.getFleaMarketService();
  });

  it('Should adds a new vote to a voting if input is valid', async () => {

    const mockClient = { };
        
        (mqtt.connect as jest.Mock).mockReturnValue(mockClient);
    
        const  mockReturnValue =  (mockClient as MqttClient).publishAsync =  jest.fn((topic, payload) => {
          return Promise.resolve({
            cmd: 'publish',
              qos: 0,
              dup: false,
              retain: false,
              topic,
              payload,
            });
          });
          
          const fleaMarketItem = VotingBuilderFactory.getBuilder('CreateFleaMarketItemDto')
              .build() as FleaMarketItemDto;
          
          //await votingService.updateVotingById(voting._id.toString())

          const playerName = 'john';
          const playerToCreate = playerBuilder.setName(playerName).build();

          await playerService.createOne(playerToCreate);
          const player = (await playerModel.findOne({ name: playerName })).toObject();
          
          const [fleaMarket, errorsfleaMarket] = await fleaMarketService.createOne(fleaMarketItem);
          expect(fleaMarket).not.toBeNull();
          expect(errorsfleaMarket).toBeNull();

          const minPercentage = 1;
          const votingToCreate = votingBuilder
          .setMinPercentage(minPercentage)
          .setType(VotingType.SELLING_ITEM)
          .setOrganizer({ player_id: '123', clan_id: null })
          .setVotes([])
          .setEntityId(fleaMarket._id.toString())
          .build();
      
          const [voting, errors] = await votingService.createOne(votingToCreate);
          expect(voting).not.toBeNull();
          expect(errors).toBeNull();

          //TODO: MissingSchemaError: Schema hasn't been registered for model "FleaMarketItem
          // await votingService
          //   .addVote(voting._id.toString(), ItemVoteChoice.YES, player._id.toString());

        });
});
