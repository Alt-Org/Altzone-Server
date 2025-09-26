import { RoomService } from '../../../clanInventory/room/room.service';
import { ClanService } from '../../../clan/clan.service';
import { PlayerService } from '../../../player/player.service';
import GameDataModule from '../modules/gameData.module';
import { GameEventsHandler } from '../../../gameEventsHandler/gameEventsHandler';
import { GameDataService } from '../../../gameData/gameData.service';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { GameEventType } from '../../../gameEventsHandler/enum/GameEventType.enum';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import GameDataBuilderFactory from '../data/gameDataBuilderFactory';
import AuthBuilderFactory from '../../auth/data/authBuilderFactory';
import { ObjectId } from 'mongodb';

describe('GameDataService.handleResultType() test suite',  () =>  {
  let playerService: PlayerService;
  let clanService: ClanService;
  let roomService: RoomService;
  let gameEventsHandler: GameEventsHandler;
  let gameDataService: GameDataService;
  
  const gameDataModel = GameDataModule.getGameModel();
  const playerModel = GameDataModule.getPlayerModel();

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const p1 = playerBuilder.setName('p1').build();
  const p2 = playerBuilder.setName('p2').build();
  const p3 = playerBuilder.setName('p3').build();
  const p4 = playerBuilder.setName('p4').build();
  
   playerModel.create(p1);
   playerModel.create(p2);
   playerModel.create(p3);
   playerModel.create(p4);

  const playerDtoBuilder = PlayerBuilderFactory.getBuilder('PlayerDto');
  const playerDto = playerDtoBuilder.setClanId('c1').build();

  const soulHomeDtoBuilder =
    ClanInventoryBuilderFactory.getBuilder('SoulHomeDto');
  const soulHomeDto = soulHomeDtoBuilder.setName('clan1').build();

  const clanDtoBuilder = ClanBuilderFactory.getBuilder('ClanDto');
  const clan1 = clanDtoBuilder
    .setSoulHome(soulHomeDto)
    .setName('clan1')
    .build();

  const userBuilder = AuthBuilderFactory.getBuilder('User');
  let userDto = userBuilder.setPlayerId('p1').build();

  const battleResultDtoBuilder =
    GameDataBuilderFactory.getBuilder('BattleResultDto');
  const battleResultDto = battleResultDtoBuilder
    .setTeam1(['p1', 'p2'])
    .setTeam2(['p3', 'p4'])
    .setWinnerTeam(1)
    .setDuration(100)
    .build();

    const gameDtoBuilder = GameDataBuilderFactory.getBuilder('Game');
    const game = gameDtoBuilder
    .setTeam1([p1._id, p2._id])
    .setTeam2([p3._id, p4._id]).setWinner(1)
    .setId(new ObjectId().toString()).build()
    gameDataModel.create(game);

  beforeEach(async () => {
    gameDataModel.deleteMany();
    jest.clearAllMocks();
    playerService = await GameDataModule.getPlayerService();
    clanService = await GameDataModule.getClanService();
    roomService = await GameDataModule.getRoomService();
    gameEventsHandler = await GameDataModule.getGameEventHandler();
    gameDataService = new GameDataService(
      {} as any, // model not needed for this test
      playerService,
      clanService,
      roomService,
      gameEventsHandler,
      { signAsync: jest.fn().mockResolvedValue('token') } as any, // mock JwtService
    );
  });

  it('should return NOT_ALLOWED error if player is not in the winning team', async () => {
    userDto = userBuilder.setPlayerId('p3').build();

    const handleEventSpy = jest
      .spyOn(gameEventsHandler, 'handleEvent')
      .mockImplementation();

    const [result, error] = await gameDataService.handleResultType(
      battleResultDto,
      userDto,
    );

    expect(handleEventSpy).toHaveBeenCalledWith(
      'p3',
      GameEventType.PLAYER_LOSE_BATTLE,
    );
    expect(result).toBeNull();
    expect(error[0]).toBeInstanceOf(ServiceError);
    expect(error[0].reason).toBe(SEReason.NOT_ALLOWED);
  });

  it('should return error if getClanIdForTeams returns error', async () => {
    jest.spyOn(gameEventsHandler, 'handleEvent').mockImplementation();
    // Mock playerService.getPlayerById to return error for team1
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValueOnce([
        null,
        [new ServiceError({ reason: SEReason.NOT_FOUND, message: 'error' })],
      ]);

    const [result, error] = await gameDataService.handleResultType(
      battleResultDto,
      userDto,
    );

    expect(result).toBeNull();
    expect(error[0]).toBeInstanceOf(ServiceError);
    expect(error[0].message).toBe('error');
  });

  it('should call createGameIfNotExists and generateResponse for winning player', async () => {
    jest.spyOn(gameEventsHandler, 'handleEvent').mockImplementation();

    // Mock playerService.getPlayerById for both teams
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValueOnce([playerDto, null])
      .mockResolvedValueOnce([playerDto, null]);

    // Mock clanService.readOneById to return a clan with SoulHome
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clan1, null]);

    const roomDtoBuilder = ClanInventoryBuilderFactory.getBuilder('RoomDto');
    const roomDto1 = roomDtoBuilder.setId('r1').build();
    const roomDto2 = roomDtoBuilder.setId('r2').build();

    // Mock roomService.readAllSoulHomeRooms to return rooms
    jest
      .spyOn(roomService, 'readAllSoulHomeRooms')
      .mockResolvedValue([[roomDto1, roomDto2], null]);

    const [result, error] = await gameDataService.handleResultType(
      battleResultDto,
      userDto,
    );

    expect(result).toMatchObject({
      stealToken: 'token',
      //soulHome_id: 'soulHomeId',
      roomIds: ['r1', 'r2'],
    });
    expect(error).toBeNull();
  });

  it('should return error if clanService.readOneById returns error', async () => {
    jest.spyOn(gameEventsHandler, 'handleEvent').mockImplementation();
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValueOnce([playerDto, null])
      .mockResolvedValueOnce([playerDto, null]);
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([
      null,
      [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          message: 'clan error',
        }),
      ],
    ]);

    const [result, error] = await gameDataService.handleResultType(
      battleResultDto,
      userDto,
    );

    expect(result).toBeNull();
    expect(error[0]).toBeInstanceOf(ServiceError);
    expect(error[0].message).toBe('clan error');
  });

  it('should return error if roomService.readAllSoulHomeRooms returns error', async () => {
    jest.spyOn(gameEventsHandler, 'handleEvent').mockImplementation();
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValueOnce([playerDto, null])
      .mockResolvedValueOnce([playerDto, null]);
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clan1, null]);
    jest.spyOn(roomService, 'readAllSoulHomeRooms').mockResolvedValue([
      null,
      [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          message: 'room error',
        }),
      ],
    ]);

    const [result, error] = await gameDataService.handleResultType(
      battleResultDto,
      userDto,
    );

    expect(result).toBeNull();
    expect(error[0]).toBeInstanceOf(ServiceError);
    expect(error[0].message).toBe('room error');
  });
});
