import { WsException } from '@nestjs/websockets';
import { Connection } from 'mongoose';
import { ChatGateway } from '../../../chat/chat.gateway';
import { WebSocketUser } from '../../../chat/types/WsUser.type';

describe('ChatGateway user initialization', () => {
  const playerService = {
    getPlayerById: jest.fn(),
  };
  const clanChatService = {
    handleJoinChat: jest.fn(),
    handleDisconnect: jest.fn(),
    handleNewClanMessage: jest.fn(),
    handleNewClanReaction: jest.fn(),
  };
  const globalChatService = {
    handleJoinChat: jest.fn(),
    handleDisconnect: jest.fn(),
    handleNewGlobalMessage: jest.fn(),
    handleNewGlobalReaction: jest.fn(),
  };
  const emitterService = {
    EmitNewDailyTaskEvent: jest.fn(),
  };

  let gateway: ChatGateway;

  const createClient = (): WebSocketUser =>
    ({
      send: jest.fn(),
      close: jest.fn(),
    }) as unknown as WebSocketUser;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new ChatGateway(
      {} as Connection,
      playerService as any,
      clanChatService as any,
      globalChatService as any,
      emitterService as any,
    );
  });

  it('sends ready after initializing the client and joining chat rooms', async () => {
    const client = createClient();
    client['token'] = { player_id: 'player-id' };
    playerService.getPlayerById.mockResolvedValue([
      {
        clan_id: 'clan-id',
        name: 'Player name',
        avatar: undefined,
      },
      null,
    ]);

    await gateway.handleConnection(client);

    expect(client.user).toEqual({
      playerId: 'player-id',
      clanId: 'clan-id',
      name: 'Player name',
      avatar: undefined,
    });
    expect(clanChatService.handleJoinChat).toHaveBeenCalledWith(client);
    expect(globalChatService.handleJoinChat).toHaveBeenCalledWith(client);
    expect(client.send).toHaveBeenLastCalledWith(
      JSON.stringify({ event: 'ready', data: true }),
    );
  });

  it.each([
    [
      'clanMessage',
      (client: WebSocketUser) => gateway.handleClanMessage({} as any, client),
    ],
    [
      'clanMessageReaction',
      (client: WebSocketUser) =>
        gateway.handleClanMessageReaction({} as any, client),
    ],
    [
      'globalMessage',
      (client: WebSocketUser) => gateway.handleGlobalMessage({} as any, client),
    ],
    [
      'globalMessageReaction',
      (client: WebSocketUser) =>
        gateway.handleGlobalReaction({} as any, client),
    ],
  ])(
    '%s rejects an uninitialized client before processing the event',
    async (_, event) => {
      const client = createClient();

      await expect(event(client)).rejects.toBeInstanceOf(WsException);
      expect(clanChatService.handleNewClanMessage).not.toHaveBeenCalled();
      expect(clanChatService.handleNewClanReaction).not.toHaveBeenCalled();
      expect(globalChatService.handleNewGlobalMessage).not.toHaveBeenCalled();
      expect(globalChatService.handleNewGlobalReaction).not.toHaveBeenCalled();
    },
  );
});
