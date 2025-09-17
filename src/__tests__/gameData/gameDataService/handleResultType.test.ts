import { RoomService } from '../../../clanInventory/room/room.service';
import { ClanService } from '../../../clan/clan.service';
import { PlayerService } from '../../../player/player.service';
import GameDataModule from '../modules/gameData.module';
import { GameEventsHandler } from '../../../gameEventsHandler/gameEventsHandler';

describe('GameDataService.handleResultType() test suite', () => {
  let playerService: PlayerService;
  let clanService: ClanService;
  let roomService: RoomService;
  let gameEventsHandler: GameEventsHandler;

  beforeEach(async () => {
    playerService = await GameDataModule.getPlayerService();
    clanService = await GameDataModule.getClanService();
    roomService = await GameDataModule.getRoomService();
    gameEventsHandler = await GameDataModule.getGameEventHandler();
    jest.clearAllMocks();
  });

  it('Should emit a sync event and be received by a listener', (done) => {});
});
