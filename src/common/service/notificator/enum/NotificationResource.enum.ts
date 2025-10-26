/**
 * Enum with resources of notifications
 *
 * A resource refers to the resource in the REST architecture
 * and describes what type of notification is coming
 */
export enum NotificationResource {
  /**
   * Notification about daily tasks = player tasks in the API
   */
  DAILY_TASK = 'daily_task',
  /**
   * Notification about voting
   */
  VOTING = 'voting',
  /**
   * Notifications about jukebox
   */
  JUKEBOX = 'jukebox',
  /**
   * Notification about friendships
   */
  FRIENDSHIP = 'friendsihp',
}
