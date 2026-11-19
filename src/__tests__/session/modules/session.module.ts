import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { SessionSchema } from '../../../session/session.schema';
import SessionCommonModule from './sessionCommonModule';
import SessionService from '../../../session/session.service';

export default class SessionModule {
  private constructor() {}

  static async getSessionService() {
    const module = await SessionCommonModule.getModule();
    return module.resolve(SessionService);
  }

  static getSessionModel() {
    return mongoose.model(ModelName.SESSION, SessionSchema);
  }
}
