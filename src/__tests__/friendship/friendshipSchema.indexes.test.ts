import { FriendshipSchema } from '../../friendship/friendship.schema';

describe('FriendshipSchema indexes', () => {
  it('indexes status lookups for either friendship participant', () => {
    const indexes = FriendshipSchema.indexes();

    expect(indexes).toEqual(
      expect.arrayContaining([
        [
          { playerA: 1, status: 1 },
          expect.objectContaining({ name: 'friendship_player_a_status' }),
        ],
        [
          { playerB: 1, status: 1 },
          expect.objectContaining({ name: 'friendship_player_b_status' }),
        ],
      ]),
    );
  });
});
