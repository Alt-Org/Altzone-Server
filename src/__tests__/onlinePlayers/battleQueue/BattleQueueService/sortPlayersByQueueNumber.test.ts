import BattleQueueModule from '../../modules/battleQueue.module';
import OnlinePlayersBuilderFactory from '../../data/onlinePlayersBuilderFactory';
import { OnlinePlayerBuilder } from '../../data/onlinePlayers/OnlinePlayerBuilder';
import { BattleWaitStatus } from '../../../../onlinePlayers/payload/additionalTypes/BattleWaitStatus';
import { BattleQueueService } from '../../../../onlinePlayers/battleQueue/battleQueue.service';

describe('BattleQueueService.sortPlayersByQueueNumber', () => {
  let service: BattleQueueService;
  let playerBuilder: OnlinePlayerBuilder<BattleWaitStatus>;

  beforeEach(async () => {
    service = await BattleQueueModule.getBattleQueueService();
    playerBuilder = OnlinePlayersBuilderFactory.getBuilder('OnlinePlayer');
  });

  it('should sort players in ascending queueNumber order', () => {
    const players = [
      playerBuilder.setAdditional({ queueNumber: 10 }).build(),
      playerBuilder.setAdditional({ queueNumber: 5 }).build(),
      playerBuilder.setAdditional({ queueNumber: 7 }).build(),
    ];

    const [sorted, errors] = service.sortPlayersByQueueNumber(players);
    const sortedNumbers = sorted.map((p) => p.additional.queueNumber);

    expect(errors).toBeNull();
    expect(sortedNumbers).toEqual([5, 7, 10]);
  });

  it('should sort players considering wrap-around queue numbers', () => {
    const players = [
      playerBuilder.setAdditional({ queueNumber: 1 }).build(),
      playerBuilder.setAdditional({ queueNumber: 9999 }).build(),
      playerBuilder.setAdditional({ queueNumber: 5 }).build(),
      playerBuilder.setAdditional({ queueNumber: 9998 }).build(),
      playerBuilder.setAdditional({ queueNumber: 0 }).build(),
    ];

    const [sorted, errors] = service.sortPlayersByQueueNumber(players);
    const sortedNumbers = sorted.map((p) => p.additional.queueNumber);

    expect(errors).toBeNull();
    expect(sortedNumbers).toEqual([9998, 9999, 0, 1, 5]);
  });

  it('should still sort correctly with gaps and wrap', () => {
    const players = [
      playerBuilder.setAdditional({ queueNumber: 9998 }).build(),
      playerBuilder.setAdditional({ queueNumber: 3 }).build(),
      playerBuilder.setAdditional({ queueNumber: 9995 }).build(),
      playerBuilder.setAdditional({ queueNumber: 9 }).build(),
      playerBuilder.setAdditional({ queueNumber: 1000 }).build(),
    ];

    const [sorted, errors] = service.sortPlayersByQueueNumber(players);
    const sortedNumbers = sorted.map((p) => p.additional.queueNumber);

    expect(errors).toBeNull();
    expect(sortedNumbers).toEqual([9995, 9998, 3, 9, 1000]);
  });

  it('Should return ServiceError NOT_FOUND if empty array is provided', () => {
    const [sorted, errors] = service.sortPlayersByQueueNumber([]);
    expect(sorted).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError NOT_FOUND if no players have the order number', () => {
    const players1 = [playerBuilder.build(), playerBuilder.build()];
    const [sorted, errors] = service.sortPlayersByQueueNumber(players1);
    expect(sorted).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
