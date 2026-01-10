import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, WebDAVClient } from 'webdav';
import { Readable } from 'stream';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { envVars } from '../common/service/envHandler/envVars';

@Injectable()
export class LogFileService implements OnModuleInit {
  private client!: WebDAVClient;
  private readonly logFilesRootFolder = envVars.OWNCLOUD_LOG_FILES_ROOT;

  onModuleInit() {
    this.client = createClient(
      `http://${envVars.OWNCLOUD_HOST}:${envVars.OWNCLOUD_PORT}/remote.php/webdav/`,
      {
        username: envVars.OWNCLOUD_USER,
        password: envVars.OWNCLOUD_PASSWORD,
        maxBodyLength: 52428800,
      },
    );
  }

  async saveFile(
    fileToSave: Express.Multer.File,
    player_id: string,
    battleId?: string,
  ) {
    if (!battleId) battleId = Date.now().toString();
    const folderPath = this.getFolderPath(battleId);
    const filePath = this.getFilePath(battleId, player_id);

    try {
      const isFileFolderExist = await this.client.exists(folderPath);
      if (!isFileFolderExist)
        await this.client.createDirectory(folderPath, { recursive: true });
    } catch (error) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            message: 'Unexpected error during folder creation',
            additional: this.getWebDavErrorData(error),
          }),
        ],
      ];
    }

    try {
      const fileStream = this.bufferToStream(fileToSave.buffer);
      const isSuccess = await this.client.putFileContents(filePath, fileStream, {
        overwrite: true,
      });

      if (!isSuccess)
        return [
          null,
          [
            new ServiceError({
              reason: SEReason.UNEXPECTED,
              message: 'Could not save the log file',
            }),
          ],
        ];

      return [true, null];
    } catch (error: any) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            message: 'Unexpected error during file saving',
            additional: this.getWebDavErrorData(error),
          }),
        ],
      ];
    }
  }

  private bufferToStream(buffer: Buffer) {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    return readable;
  }

  private getWebDavErrorData(error: any) {
    return error?.response?.data ?? null;
  }

  private getFolderPath(battleId: string) {
    const folderDataName = this.getDateFolderName();
    return `${this.logFilesRootFolder}/${folderDataName}/${battleId}`;
  }

  private getFilePath(battleId: string, player_id: string) {
    const folderPath = this.getFolderPath(battleId);
    const fileName = this.getFileName(player_id);
    return `${folderPath}/${fileName}`;
  }

  private getDateFolderName() {
    return this.getDateString();
  }

  private getFileName(player_id: string) {
    const dateString = this.getDateString();
    const timeString = this.getTimeString();
    const randomString = Math.floor(Math.random() * 1000000);
    return `${dateString}_${timeString}_${player_id}_${randomString}.log`;
  }

  private getDateString() {
    const now = new Date();
    return `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
  }

  private getTimeString() {
    const now = new Date();
    return `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
  }
}
