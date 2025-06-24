/**
 * Enum used to specify the event type of websocket messages sent from server.
 */
export enum MessageEventType {
  NEW_MESSAGE = 'newMessage',
  NEW_REACTION = 'newReaction',
}
