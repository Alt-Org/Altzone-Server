import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { SessionTaskRewarder } from '../../../../box/packageRace/sessionTask/sessionTaskRewarder.service';
import { SessionTaskCompletion } from '../../../../box/packageRace/sessionTask/sessionTaskCompletion.schema';
import { uniqueName } from './startedBox';

/**
 * Returns the model of the session task completions.
 *
 * @param connection mongoose connection of the test module
 */
export const getCompletionModel = (connection: Connection) =>
  connection.model<SessionTaskCompletion>(SessionTaskCompletion.name);

/**
 * Creates a player that belongs to the specified box and team.
 *
 * @returns _id of the created player
 */
export const createBoxPlayer = async (box_id: string, clanId: ObjectId) => {
  const player = await PlayerModule.getPlayerModel().create({
    ...PlayerBuilderFactory.getBuilder('Player')
      .setName(uniqueName('tester'))
      .setUniqueIdentifier(uniqueName('device'))
      .setClanId(clanId)
      .build(),
    box_id,
  });
  return player._id.toString();
};

/**
 * Runs rewardTeam() in a committed transaction, the way the daily task flow does.
 */
export const completeSessionTask = async (
  rewarder: SessionTaskRewarder,
  connection: Connection,
  teamId: ObjectId,
  playerId: string,
  type: string,
) => {
  const session = await connection.startSession();
  try {
    session.startTransaction();
    const result = await rewarder.rewardTeam(
      {
        teamId: teamId.toString(),
        completedByPlayerId: playerId,
        task: { _id: new ObjectId(), type, coins: 10 },
      },
      session,
    );
    if (result[1]) throw result[1];
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    if (error) throw error;
  } finally {
    await session.endSession();
  }
};
