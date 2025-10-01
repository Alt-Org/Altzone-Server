import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TeacherProfile } from './teacher-profile.schema';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ARGON2_CONFIG } from '../profile/profile.service';
import { IServiceReturn } from '../common/service/basicService/IService';
import ServiceError, {
  isServiceError,
} from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(TeacherProfile.name) model: Model<TeacherProfile>,
    private readonly jwtService: JwtService,
  ) {
    this.basicService = new BasicService(model);
  }

  readonly basicService: BasicService;

  /**
   * Creates a teacher profile with hashed password and returns a accessToken
   * @param username - Desired username
   * @param password - Plain text password to be hashed
   * @returns JWT access token
   */
  async register(
    username: string,
    password: string,
  ): Promise<IServiceReturn<{ accessToken: string }>> {
    const hashedPassword = await argon2.hash(password, ARGON2_CONFIG);
    const [createdProfile, createErrors] = await this.basicService.createOne<
      { username: string; password: string },
      TeacherProfile
    >({ username: username, password: hashedPassword });
    if (createErrors) return [null, createErrors];

    const accessToken = await this.jwtService.signAsync({
      profile_id: createdProfile['_id'],
    });

    return [{ accessToken }, null];
  }

  /**
   * Login with teacher profile.
   * @param username - teacher profile username
   * @param password - teacher profile password
   * @returs JWT access token
   */
  async login(
    username: string,
    password: string,
  ): Promise<IServiceReturn<{ accessToken: string }>> {
    const [profile, errors] = await this.basicService.readOne<TeacherProfile>({
      filter: { username },
    });
    if (errors) return [null, errors];

    const passwordMatch = await argon2.verify(profile.password, password);
    if (!passwordMatch) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            message: 'Invalid credentials',
          }),
        ],
      ];
    }

    const accessToken = await this.jwtService.signAsync({
      profile_id: profile['_id'],
    });

    return [{ accessToken }, null];
  }
}
