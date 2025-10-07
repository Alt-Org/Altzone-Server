import { Injectable } from '@nestjs/common';
import { BoxUser } from './auth/BoxUser';

@Injectable()
export class BoxUserFactory {
  createFromJwtPayload(payload: BoxUser): BoxUser {
    return new BoxUser(payload);
  }
}
