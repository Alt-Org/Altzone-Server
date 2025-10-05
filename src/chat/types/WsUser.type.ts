import { WebSocket } from 'ws';
import { Avatar } from '../../player/schemas/avatar.schema';

/**
 * Represents a user connected via WebSocket in the chat system.
 *
 * @property playerId - The _id of the player.
 * @property clanId - Optional _id of the clan the user belongs to.
 * @property name - The name of the player.
 */
export type WsUser = {
  playerId: string;
  clanId?: string;
  name: string;
  avatar?: Avatar;
};

/**
 * Extends the WebSocket interface to optionally include a user object.
 *
 * @property user - An optional user object associated with the WebSocket connection.
 */
export type WebSocketUser = WebSocket & {
  user?: WsUser;
};
