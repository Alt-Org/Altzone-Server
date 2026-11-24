import { ModelName } from '../../../common/enum/modelName.enum';
import { MatchmakingMatchHistorySchema } from '../../../matchmaking/schema/matchmakingMatchHistory.schema';

describe('MatchmakingMatchHistorySchema', () => {
  it('uses the permanent matchmaking history collection', () => {
    expect(MatchmakingMatchHistorySchema.get('collection')).toBe(
      ModelName.MATCHMAKING_MATCH_HISTORY,
    );
  });

  it('enforces match idempotency and indexes history lookups without a TTL', () => {
    const indexes = MatchmakingMatchHistorySchema.indexes();

    expect(indexes).toEqual(
      expect.arrayContaining([
        [
          { matchId: 1 },
          expect.objectContaining({
            name: 'uniq_matchmaking_match_history_match_id',
            unique: true,
          }),
        ],
        [
          { 'teams.participants.playerId': 1, finishedAt: -1 },
          expect.objectContaining({
            name: 'matchmaking_history_player_finished_at',
          }),
        ],
        [
          { 'teams.clan.clanId': 1, finishedAt: -1 },
          expect.objectContaining({
            name: 'matchmaking_history_clan_finished_at',
          }),
        ],
      ]),
    );
    expect(indexes).not.toEqual(
      expect.arrayContaining([
        [
          expect.anything(),
          expect.objectContaining({ expireAfterSeconds: expect.any(Number) }),
        ],
      ]),
    );
  });
});
