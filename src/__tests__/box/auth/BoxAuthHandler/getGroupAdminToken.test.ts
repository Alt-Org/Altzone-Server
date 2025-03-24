import BoxAuthHandler from '../../../../box/auth/BoxAuthHandler';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import BoxModule from '../../modules/box.module';
import { JwtService } from '@nestjs/jwt';

describe('BoxAuthHandler.getGroupAdminToken() test suite', () => {
  let boxAuthHandler: BoxAuthHandler;
  const boxUserBuilder = BoxBuilderFactory.getBuilder('BoxUser');
  const boxAdminUser = boxUserBuilder.setGroupAdmin(true).build();

  beforeEach(async () => {
    boxAuthHandler = await BoxModule.getBoxAuthHandler();
  });

  it('Should call the JWTService.signAsync() with correct params', async () => {
    const jwtMethod = jest
      .spyOn(JwtService.prototype, 'signAsync')
      .mockResolvedValueOnce('token');

    await boxAuthHandler.getGroupAdminToken(boxAdminUser);

    expect(jwtMethod).toHaveBeenCalledTimes(1);
    expect(jwtMethod).toHaveBeenCalledWith(boxAdminUser);
  });

  it('Should return token from the JWTService.signAsync() response', async () => {
    const jwtToken = 'returned-token';
    jest
      .spyOn(JwtService.prototype, 'signAsync')
      .mockResolvedValueOnce(jwtToken);

    const returnedToken = await boxAuthHandler.getGroupAdminToken(boxAdminUser);
    expect(returnedToken).toBe(jwtToken);
  });
});
