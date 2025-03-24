import { CreateBoxDto } from '../../../../box/dto/createBox.dto';

export default class CreateBoxDtoBuilder {
  private readonly base: CreateBoxDto = {
    adminPassword: 'defaultAdminPassword',
    playerName: 'defaultPlayerName',
    clanNames: undefined,
  };

  build(): CreateBoxDto {
    return { ...this.base } as CreateBoxDto;
  }

  setAdminPassword(password: string) {
    this.base.adminPassword = password;
    return this;
  }

  setPlayerName(playerName: string) {
    this.base.playerName = playerName;
    return this;
  }

  setClanNames(clanNames: string[]) {
    this.base.clanNames = clanNames;
    return this;
  }
}
