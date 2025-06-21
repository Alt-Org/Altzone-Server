import { WebSocket } from 'ws';

export type WsUser = {
  playerId: string;
  clanId?: string;
  name: string;
};

export type WebSocketUser = WebSocket & {
  user?: WsUser;
};
