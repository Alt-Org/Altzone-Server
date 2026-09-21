import { ServerTaskName } from '../../../../dailyTasks/enum/serverTaskName.enum';
import { StrongerSoldierStep } from '../../../../dailyTasks/enum/strongerSoldierStep.enum';
import { CustomCharacterController } from '../../../../player/customCharacter/customCharacter.controller';
import { CharacterId } from '../../../../player/customCharacter/enum/characterId.enum';

describe('CustomCharacterController stronger soldier progress', () => {
  const createController = (previousAttack = 10) => {
    const service = {
      readOne: jest.fn().mockResolvedValue([
        {
          _id: 'character-1',
          characterId: CharacterId.Racist_101,
          player_id: 'player-1',
          attack: previousAttack,
        },
        null,
      ]),
      updateOneByCondition: jest.fn().mockResolvedValue([true, null]),
    };
    const emitterService = {
      EmitNewDailyTaskEvent: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new CustomCharacterController(
      service as any,
      emitterService as any,
    );

    return { controller, emitterService, service };
  };

  const user = { player_id: 'player-1' } as any;

  it('emits the first step after increasing the owned character attack', async () => {
    const { controller, emitterService, service } = createController(10);

    await controller.update({ _id: 'character-1', attack: 11 }, user);

    const ownershipFilter = {
      player_id: 'player-1',
      _id: 'character-1',
    };
    expect(service.readOne).toHaveBeenCalledWith({ filter: ownershipFilter });
    expect(service.updateOneByCondition).toHaveBeenCalledWith(
      { _id: 'character-1', attack: 11 },
      { filter: ownershipFilter },
    );
    expect(emitterService.EmitNewDailyTaskEvent).toHaveBeenCalledWith(
      'player-1',
      ServerTaskName.STRONGER_SOLDIER,
      true,
      { strongerSoldierStep: StrongerSoldierStep.ATTACK_INCREASED },
    );
  });

  it.each([
    ['unchanged attack', { _id: 'character-1', attack: 10 }],
    ['decreased attack', { _id: 'character-1', attack: 9 }],
    ['another stat', { _id: 'character-1', speed: 12 }],
  ])('does not emit for %s', async (_caseName, body) => {
    const { controller, emitterService } = createController(10);

    await controller.update(body, user);

    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not update or emit when the owned character cannot be read', async () => {
    const { controller, emitterService, service } = createController();
    const readErrors = [{ message: 'not found' }];
    service.readOne.mockResolvedValueOnce([null, readErrors]);

    const result = await controller.update(
      { _id: 'character-1', attack: 11 },
      user,
    );

    expect(result).toEqual([null, readErrors]);
    expect(service.updateOneByCondition).not.toHaveBeenCalled();
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not emit when the character update fails', async () => {
    const { controller, emitterService, service } = createController();
    const updateErrors = [{ message: 'update failed' }];
    service.updateOneByCondition.mockResolvedValueOnce([null, updateErrors]);

    const result = await controller.update(
      { _id: 'character-1', attack: 11 },
      user,
    );

    expect(result).toEqual([null, updateErrors]);
    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });

  it('does not emit when no character was updated', async () => {
    const { controller, emitterService, service } = createController();
    service.updateOneByCondition.mockResolvedValueOnce([false, null]);

    await controller.update({ _id: 'character-1', attack: 11 }, user);

    expect(emitterService.EmitNewDailyTaskEvent).not.toHaveBeenCalled();
  });
});
