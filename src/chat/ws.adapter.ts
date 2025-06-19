import { INestApplicationContext } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import * as WebSocket from 'ws';
import * as http from 'http';
import * as url from 'url';
import * as jwt from 'jsonwebtoken';
import { envVars } from '../common/service/envHandler/envVars';

export class JwtWsAdapter extends WsAdapter {
  constructor(app: INestApplicationContext, server: http.Server) {
    super(app);
    this.server = server;
  }

  private server: http.Server;

  create(): WebSocket.Server {
    const wss = new WebSocket.Server({ noServer: true });

    this.server.on('upgrade', (req, socket, head) => {
      const token = this.extractToken(req);
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      try {
        const payload = jwt.verify(token, envVars.JWT_SECRET);
        wss.handleUpgrade(req, socket, head, (ws) => {
          ws['token'] = payload;
          wss.emit('connection', ws, req);
        });
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    });

    return wss;
  }

  private extractToken(req: http.IncomingMessage): string | null {
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    const parsedUrl = url.parse(req.url, true);
    const token = parsedUrl.query['token'];

    return typeof token === 'string' ? token : null;
  }
}
