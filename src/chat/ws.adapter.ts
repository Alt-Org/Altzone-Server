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

  /**
   * Creates and configures a new WebSocket server instance with JWT authentication.
   *
   * The server listens for HTTP upgrade requests and attempts to extract and verify a JWT token.
   * If the token is valid, the WebSocket connection is established and the decoded token payload
   * is attached to the WebSocket instance. If the token is missing or invalid, the connection is rejected.
   *
   * @returns A configured WebSocket server instance.
   */
  create(): WebSocket.Server {
    const wss = new WebSocket.Server({ noServer: true });

    this.server.on('upgrade', (req, socket, head) => {
      if (!req.url.startsWith('/ws/chat')) {
        socket.destroy();
        return;
      }
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

  /**
   * Extracts a bearer token from the HTTP request.
   *
   * This method first checks the `Authorization` header for a bearer token.
   * If not found, it attempts to extract a `token` query parameter from the request URL.
   *
   * @param req The incoming HTTP request object.
   * @returns The extracted token.
   */
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
