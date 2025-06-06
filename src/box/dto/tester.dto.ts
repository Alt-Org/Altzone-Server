export class TesterDto {
  /**
   * Profile _id of the tester
   * @example "663a5d7cde9f1a0012f3a660"
   */
  profile_id: string;

  /**
   * Profile _id of the tester
   * @example "663a5d0ade9f1a0012f3a550"
   */
  player_id: string;

  /**
   * Has the account already been claimed by some device
   * @example true
   */
  isClaimed: boolean;
}
