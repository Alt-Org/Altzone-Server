import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TeacherProfile } from './teacher-profile.schema';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(TeacherProfile.name) model: Model<TeacherProfile>,
    jwtService: JwtService,
  ) {
    this.basicService = new BasicService(model);
  }

  readonly basicService: BasicService;
}
