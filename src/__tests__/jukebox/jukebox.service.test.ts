import type { AddSongDto } from '../../jukebox/dto/AddSong.dto';
import type { Jukebox } from '../../jukebox/type/playlist';

type MockMqttClient = {
  publishAsync: jest.Mock<Promise<void>, [string, string | Buffer]>;
  publish: jest.Mock<void, [string, string | Buffer]>;
  subscribe: jest.Mock<Promise<string[]>, [string]>;
  on: jest.Mock<void, [string, (...args: any[]) => void]>;
  end: jest.Mock<void, []>;
  subscriptions: Set<string>;
  messageCallback?: (topic: string, payload: string | Buffer) => void;
};

function createMockMqttBroker() {
  const clients: MockMqttClient[] = [];

  const createClient = (): MockMqttClient => {
    const subscriptions = new Set<string>();
    let messageCallback:
      | ((topic: string, payload: string | Buffer) => void)
      | undefined;

    const client: MockMqttClient = {
      publishAsync: jest.fn(async (topic: string, payload: string | Buffer) => {
        for (const otherClient of clients) {
          if (
            otherClient !== client &&
            otherClient.messageCallback &&
            otherClient.subscriptions.has(topic)
          ) {
            otherClient.messageCallback(topic, payload);
          }
        }
      }),
      publish: jest.fn((topic: string, payload: string | Buffer) => {
        for (const otherClient of clients) {
          if (
            otherClient !== client &&
            otherClient.messageCallback &&
            otherClient.subscriptions.has(topic)
          ) {
            otherClient.messageCallback(topic, payload);
          }
        }
      }),
      subscribe: jest.fn(async (topic: string) => {
        subscriptions.add(topic);
        return [topic];
      }),
      on: jest.fn((event: string, callback: (...args: any[]) => void) => {
        if (event === 'message') {
          messageCallback = callback as (
            topic: string,
            payload: string | Buffer,
          ) => void;
        }
      }),
      end: jest.fn(() => {
        const index = clients.indexOf(client);
        if (index >= 0) {
          clients.splice(index, 1);
        }
      }),
      subscriptions,
      get messageCallback() {
        return messageCallback;
      },
      set messageCallback(value) {
        messageCallback = value;
      },
    };

    clients.push(client);
    return client;
  };

  return { createClient, clients };
}

describe('JukeboxService', () => {
  let service: any;
  let notifier: any;
  let mqtt: any;
  let broker: ReturnType<typeof createMockMqttBroker>;
  let clanServiceMock: any;

  const clanId = 'clan-123';

  beforeEach(async () => {
    jest.resetModules();

    mqtt = jest.requireMock('mqtt');
    broker = createMockMqttBroker();

    mqtt.connect.mockImplementation(() => broker.createClient());

    const { default: JukeboxNotifier } = await import(
      '../../jukebox/jukebox.notifier'
    );
    const { JukeboxService } = await import('../../jukebox/jukebox.service');

    clanServiceMock = {
      readOneById: jest.fn(async () => [{ playerCount: 20 }]),
    };

    notifier = new JukeboxNotifier();
    service = new JukeboxService(notifier, clanServiceMock);
  });

  it('addSongToClanJukebox publishes songChange to the expected MQTT topic', async () => {
    const song: AddSongDto = { songId: 'song-1', songDurationSeconds: 3600 };

    await service.addSongToClanJukebox(clanId, 'player-1', song);

    const backendClient = broker.clients[0];

    expect(backendClient.publishAsync).toHaveBeenCalledTimes(2);
    expect(backendClient.publishAsync).toHaveBeenNthCalledWith(
      1,
      `/clan/${clanId}/jukebox/song/update`,
      expect.any(String),
    );
    expect(backendClient.publishAsync).toHaveBeenNthCalledWith(
      2,
      `/clan/${clanId}/jukebox/playlist/update`,
      expect.any(String),
    );

    const payload = JSON.parse(
      backendClient.publishAsync.mock.calls[0][1].toString(),
    );
    expect(payload.song).toEqual(expect.objectContaining({ songId: 'song-1' }));

    const jukebox: Jukebox = service.getClanJukebox(clanId);
    expect(jukebox.currentSong).toEqual(
      expect.objectContaining({ songId: 'song-1', playerId: 'player-1' }),
    );
  });

  it('removeSongFromQueue removes only the queued song and throws when song is not found', async () => {
    const firstSong: AddSongDto = {
      songId: 'song-1',
      songDurationSeconds: 3600,
    };
    const secondSong: AddSongDto = {
      songId: 'song-2',
      songDurationSeconds: 3600,
    };

    await service.addSongToClanJukebox(clanId, 'player-1', firstSong);
    await service.addSongToClanJukebox(clanId, 'player-2', secondSong);

    const queuedSong = service.getClanJukebox(clanId).songQueue[0];
    expect(queuedSong.songId).toBe('song-2');

    service.removeSongFromQueue(clanId, 'player-2', queuedSong.id);
    expect(service.getClanJukebox(clanId).songQueue).toHaveLength(0);

    try {
      service.removeSongFromQueue(clanId, 'player-2', 'non-existent-id');
      throw new Error('Expected removeSongFromQueue to throw');
    } catch (err: any) {
      expect(err).toBeDefined();
      expect(err.reason).toBe('NOT_FOUND');
    }
  });

  it('startNextSong advances to the next song and publishes the new current song', async () => {
    const firstSong: AddSongDto = {
      songId: 'song-1',
      songDurationSeconds: 3600,
    };
    const secondSong: AddSongDto = {
      songId: 'song-2',
      songDurationSeconds: 3600,
    };

    await service.addSongToClanJukebox(clanId, 'player-1', firstSong);
    await service.addSongToClanJukebox(clanId, 'player-2', secondSong);

    const backendClient = broker.clients[0];

    expect(service.getClanJukebox(clanId).songQueue).toHaveLength(1);
    const songUpdateCallsBefore = backendClient.publishAsync.mock.calls.filter(
      (c) => c[0] === `/clan/${clanId}/jukebox/song/update`,
    );
    expect(songUpdateCallsBefore.length).toBeGreaterThanOrEqual(1);

    await service.startNextSong(clanId);

    const songUpdateCalls = backendClient.publishAsync.mock.calls.filter(
      (c) => c[0] === `/clan/${clanId}/jukebox/song/update`,
    );
    expect(songUpdateCalls.length).toBeGreaterThanOrEqual(2);

    const lastSongCall = songUpdateCalls[songUpdateCalls.length - 1];
    const secondPayload = JSON.parse(lastSongCall[1].toString());
    expect(secondPayload.song).toEqual(
      expect.objectContaining({ songId: 'song-2' }),
    );
    expect(service.getClanJukebox(clanId).currentSong.songId).toBe('song-2');
  });

  it('simulates frontend receiving MQTT updates in real time for add-song and song-change events', async () => {
    const received: Array<{ topic: string; payload: string }> = [];
    const frontendClient = mqtt.connect();

    await frontendClient.subscribe(`/clan/${clanId}/jukebox/song/update`);
    frontendClient.on('message', (topic: string, payload: string | Buffer) => {
      received.push({ topic, payload: payload.toString() });
    });

    const firstSong: AddSongDto = {
      songId: 'song-1',
      songDurationSeconds: 3600,
    };
    const secondSong: AddSongDto = {
      songId: 'song-2',
      songDurationSeconds: 3600,
    };
    const thirdSong: AddSongDto = {
      songId: 'song-3',
      songDurationSeconds: 3600,
    };

    await service.addSongToClanJukebox(clanId, 'player-1', firstSong);
    await service.addSongToClanJukebox(clanId, 'player-2', secondSong);

    const secondQueuedSongId = service.getClanJukebox(clanId).songQueue[0].id;
    service.removeSongFromQueue(clanId, 'player-2', secondQueuedSongId);

    await service.addSongToClanJukebox(clanId, 'player-2', thirdSong);
    await service.startNextSong(clanId);

    expect(received).toHaveLength(2);
    expect(received[0].topic).toBe(`/clan/${clanId}/jukebox/song/update`);
    expect(JSON.parse(received[0].payload).song.songId).toBe('song-1');
    expect(JSON.parse(received[1].payload).song.songId).toBe('song-3');
  });
});
