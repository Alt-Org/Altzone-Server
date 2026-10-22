import { AuthService } from '../../../auth/auth.service';
import AuthCommonModule from './authCommonModule';
import { AuthGuard } from '../../../auth/auth.guard';
import BoxAuthService from '../../../auth/box/BoxAuthService';
import { BoxTestingSessionGuard } from '../../../box/auth/boxTestingSession.guard';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { ModelName } from '../../../common/enum/modelName.enum';
import { SessionSchema } from '../../../auth/session.schema';

export default class AuthModule {
  private constructor() {}

  static async getAuthService() {
    const module = await AuthCommonModule.getModule();
    return module.resolve(AuthService);
  }

  static async getAuthGuard() {
    const module = await AuthCommonModule.getModule();
    return module.resolve(AuthGuard);
  }

  static async getBoxAuthService() {
    const module = await AuthCommonModule.getModule();
    return module.resolve(BoxAuthService);
  }

  static async getBoxTestingGuard() {
    const module = await AuthCommonModule.getModule();
    return module.resolve(BoxTestingSessionGuard);
  }

  static async getJwtService() {
    const module = await AuthCommonModule.getModule();
    return module.resolve(JwtService);
  }

  static getSessionModel() {
    return mongoose.model(ModelName.SESSION, SessionSchema);
  }
}
