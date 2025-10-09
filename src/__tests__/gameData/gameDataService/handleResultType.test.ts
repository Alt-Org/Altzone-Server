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
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';
import { JwtService } from '@nestjs/jwt';
import { Game } from '../../../gameData/game.schema';
import { BattleResultDto } from '../../../gameData/dto/battleResult.dto';

describe('GameDataService.handleResultType() test suite', () => {
  const gameDataModel = GameDataModule.getGameModel();
  const playerModel = GameDataModule.getPlayerModel();

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const battleResultDtoBuilder =
    GameDataBuilderFactory.getBuilder('BattleResultDto');
  const playerDtoBuilder = PlayerBuilderFactory.getBuilder('PlayerDto');
  const soulHomeDtoBuilder =
    ClanInventoryBuilderFactory.getBuilder('SoulHomeDto');
  const clanDtoBuilder = ClanBuilderFactory.getBuilder('ClanDto');
  const userBuilder = AuthBuilderFactory.getBuilder('User');
  const gameDtoBuilder = GameDataBuilderFactory.getBuilder('Game');
  const roomDtoBuilder = ClanInventoryBuilderFactory.getBuilder('RoomDto');

  let playerService: PlayerService;
  let clanService: ClanService;
  let roomService: RoomService;
  let gameEventsHandler: GameEventsHandler;
  let gameDataService: GameDataService;
  let eventEmitterService: EventEmitterService;
  let battleResultDto: BattleResultDto;
  let game: Game;

  const p1Id = new ObjectId();
  const p2Id = new ObjectId();
  const p3Id = new ObjectId();
  const p4Id = new ObjectId();

  const p1 = playerBuilder.setId(p1Id.toString()).setName('p1').build();
  const p2 = playerBuilder.setId(p2Id.toString()).setName('p2').build();
  const p3 = playerBuilder.setId(p3Id.toString()).setName('p3').build();
  const p4 = playerBuilder.setId(p4Id.toString()).setName('p4').build();

  playerModel.create(p1);
  playerModel.create(p2);
  playerModel.create(p3);
  playerModel.create(p4);

  const playerDto = playerDtoBuilder.setClanId('c1').build();

  const soulHomeDto = soulHomeDtoBuilder.setName('clan').build();

  const clan = clanDtoBuilder.setSoulHome(soulHomeDto).setName('clan').build();

  let userDto = userBuilder.setPlayerId(p1Id.toString()).build();

  beforeEach(async () => {
    jest.resetAllMocks();
    gameDataModel.deleteMany();

    battleResultDto = battleResultDtoBuilder
      .setTeam1([p1Id.toString(), p2Id.toString()])
      .setTeam2([p3Id.toString(), p4Id.toString()])
      .setWinnerTeam(1)
      .setDuration(100)
      .build();

    game = gameDtoBuilder
      .setTeam1([p1Id.toString(), p2Id.toString()])
      .setTeam2([p3Id.toString(), p4Id.toString()])
      .setWinner(1)
      .setId(new ObjectId().toString())
      .build();

    gameDataModel.create(game);

    const roomDto1 = roomDtoBuilder.setId('r1').build();
    const roomDto2 = roomDtoBuilder.setId('r2').build();

    userDto = userBuilder.setPlayerId(p1Id.toString()).build();

    playerService = await GameDataModule.getPlayerService();
    clanService = await GameDataModule.getClanService();
    roomService = await GameDataModule.getRoomService();
    gameEventsHandler = await GameDataModule.getGameEventHandler();

    eventEmitterService = await GameDataModule.getEventEmitterService();

    jest.spyOn(JwtService.prototype, 'signAsync').mockResolvedValue('token');

    jest
      .spyOn(roomService, 'readAllSoulHomeRooms')
      .mockResolvedValue([[roomDto1, roomDto2], null]);

    jest.spyOn(gameEventsHandler, 'handleEvent').mockImplementation();
    jest
      .spyOn(eventEmitterService, 'EmitNewDailyTaskEvent')
      .mockImplementation();

    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([playerDto, null]);

    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clan, null]);

    gameDataService = await GameDataModule.getGameDataService();

    const execMock = jest.fn().mockResolvedValue(game);
    const query = { sort: jest.fn().mockReturnThis(), exec: execMock };
    jest.fn().mockReturnValue(query);
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
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([
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
    const [result, error] = await gameDataService.handleResultType(
      battleResultDto,
      userDto,
    );

    expect(result).toMatchObject({
      stealToken: 'token',
      soulHome_id: clan?.SoulHome?._id,
      roomIds: ['r1', 'r2'],
    });
    expect(error).toBeNull();
  });

  it('should return error if clanService.readOneById returns error', async () => {
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
