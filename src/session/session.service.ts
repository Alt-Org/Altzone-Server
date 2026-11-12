import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Session } from './session.schema';
import BasicService from '../common/service/basicService/BasicService';
import { CreateSessionDto } from './dto/createSession.dto';
import { SessionDto } from './dto/session.dto';
import { TIServiceUpdateOneOptions } from '../common/service/basicService/IService';

@Injectable()
export default class SessionService {
  constructor(
    @InjectModel(Session.name) public readonly model: Model<Session>
  ) {
    this.basicService = new BasicService(model);
  }

  public readonly basicService: BasicService;

  /**
   * Creates a new Session in DB.
   *
   * @param payload - The Session data to create.
   * @param session - Optional mongoose ClientSession for transaction support.
   * @returns created Session or an array of service errors if any occurred.
   */
  async createOne(payload: CreateSessionDto, session?: ClientSession) {
    return this.basicService.createOne(payload, { session });
  }

  /**
   * Read a Session in DB by ID.
   *
   * @param payload - The Session data.
   * @param session - Optional mongoose ClientSession for transaction support.
   * @returns Session or an array of service errors if any occurred.
   */
  async readOneById(_id: string, session?: ClientSession) {
    return this.basicService.readOneById(_id, { session });
  }

  /**
   * Updates a Session in DB.
   *
   * @param update - The Session data to update.
   * @param options - Options for updating, filter and optional ClientSession
   * @returns updated Session or an array of service errors if any occurred.
   */
  async updateOne(update: Partial<SessionDto>, options: TIServiceUpdateOneOptions) {
    return this.basicService.updateOne(update, options);
  }
}
