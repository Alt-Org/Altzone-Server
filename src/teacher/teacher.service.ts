import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TeacherProfile } from './teacher-profile.schema';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { ARGON2_CONFIG } from '../profile/profile.service';
import { IServiceReturn } from '../common/service/basicService/IService';

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
   * @param profile - Object containing the desired username and password.
   * @returns
   */
  async register(profile: {
    username: string;
    password: string;
  }): Promise<IServiceReturn<{ accessToken: string }>> {
    const hashedPassword = await argon2.hash(profile.password, ARGON2_CONFIG);
    const [createdProfile, createErrors] = await this.basicService.createOne<
      { username: string; password: string },
      TeacherProfile
    >({ username: profile.username, password: hashedPassword });
    if (createErrors) return [null, createErrors];

    const accessToken = await this.jwtService.signAsync({
      profile_id: createdProfile['_id'],
    });

    return [{ accessToken }, null];
  }
}
