import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BattleService } from '../../../gameData/battle/battle.service';
import { Battle } from '../../../gameData/battle/schema/battle.schema';
import { BattleStatus } from '../../../gameData/battle/enum/battleStatus.enum';
import { BattleResultDtoBuilder } from '../data/gameData/BattleResultDtoBuilder';

describe('BattleService', () => {
  let service: BattleService;
  let model: any;

  const mockBattleModel = {
    findOne: jest.fn(),
    new: jest.fn().mockResolvedValue({ save: jest.fn() }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleService,
        {
          provide: getModelToken(Battle.name),
          useValue: mockBattleModel,
        },
      ],
    }).compile();

    service = module.get<BattleService>(BattleService);
    model = module.get(getModelToken(Battle.name));
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should trigger the 2-minute "Final Call" on conflicting results', async () => {
  const fakeBattle: any = {
    matchId: 'm1',
    receivedResults: [],
    status: BattleStatus.OPEN,
    team1: ['pA'], 
    team2: ['pB'],
    save: jest.fn().mockImplementation(function(this: any) { 
      return Promise.resolve(this); 
    }),
  };
  
  model.findOne.mockReturnValue(Promise.resolve(fakeBattle));

  const playerAResult = new BattleResultDtoBuilder().setWinnerTeam(1).build();
  const playerBResult = new BattleResultDtoBuilder().setWinnerTeam(2).build();

  await service.handleBattleResult(playerAResult as any, 'pA');
  await service.handleBattleResult(playerBResult as any, 'pB');

  expect(fakeBattle.status).toBe(BattleStatus.PROCESSING);
  
  jest.runOnlyPendingTimers();
  
  await Promise.resolve(); 
  await Promise.resolve(); 
  await Promise.resolve();
  
  expect(fakeBattle.status).toBe(BattleStatus.COMPLETED);
}, 15000);
});