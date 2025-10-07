import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Box } from '../schemas/box.schema';
import { Model } from 'mongoose';
import { GroupAdmin } from '../groupAdmin/groupAdmin.schema';
import { Profile } from '../../profile/profile.schema';
import { Player } from '../../player/schemas/player.schema';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { IServiceReturn } from '../../common/service/basicService/IService';
import BasicService from '../../common/service/basicService/BasicService';
import { Box as v2Box } from '../schemas/box.v2.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class BoxHelper {
  public constructor(
    @InjectModel(Box.name) public readonly model: Model<Box>,
    @InjectModel("v2Box") private readonly v2model: Model<v2Box>,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
    @InjectModel(Profile.name) public readonly profileModel: Model<Profile>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
  ) {
    this.basicService = new BasicService(model);
  }
  private readonly basicService: BasicService;

  /**
   * Validates that all the data provided for the box can be found from DB
   *
   * @param box
   *
   * @returns true if everything is valid or NOT_FOUND ServiceError if some of the data can not be found
   */
  public async validateBox(box: Box): Promise<IServiceReturn<true>> {
    if (!box)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'box',
            value: box,
            message: 'box parameter is required',
          }),
        ],
      ];

    if (!box.adminPassword)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'adminPassword',
            value: box.adminPassword,
            message: 'adminPassword is required',
          }),
        ],
      ];

    const adminPasswordInDB = await this.groupAdminModel.findOne({
      password: box.adminPassword,
    });
    if (!adminPasswordInDB)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'adminPassword',
            value: box.adminPassword,
            message: 'Admin password is not found',
          }),
        ],
      ];

    const adminProfile = await this.profileModel.findById(box.adminProfile_id);
    if (!adminProfile)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'adminProfile_id',
            value: box.adminProfile_id,
            message: 'Admin profile _id is not found',
          }),
        ],
      ];

    const adminPlayer = await this.playerModel.findById(box.adminPlayer_id);
    if (!adminPlayer)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'adminPlayer_id',
            value: box.adminPlayer_id,
            message: 'Admin player _id is not found',
          }),
        ],
      ];

    return [true, null];
  }

  /**
   * Checks whenever a box for specified group admin is already created.
   * @param groupAdminPassword group admin password
   *
   * @return true if the box is registered or false if not
   */
  public async isBoxRegistered(groupAdminPassword: string): Promise<boolean> {
    const [box] = await this.basicService.readOne<Box>({
      filter: { adminPassword: groupAdminPassword },
    });

    return box ? true : false;
  }

  /**
   * Checks if a box can be created
   * @param teacherProfile_id
   *
   * @returns true if box can be created or ServiceErrors if found
   */
  async canCreateBox(
    teacherProfile_id: string,
  ): Promise<IServiceReturn<true>> {
    const boxCount = await this.v2model.countDocuments({ teacherProfile_id: new ObjectId(teacherProfile_id) });
    if (boxCount >= 10)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.MORE_THAN_MAX,
            message: 'Box limit reached. Delete one to create more.',
          }),
        ],
      ];

    return [true, null];
  }

  async duplicateName(teacherProfile_id: string, boxName: string): Promise<IServiceReturn<true>> {
    const boxCount = await this.v2model.countDocuments({ teacherProfile_id: new ObjectId(teacherProfile_id), name: boxName });
    if (boxCount > 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            message: 'Duplicate name. Teacher already has a session with that name.'
          })
        ]
      ]

    return [true, null];
  }
}
