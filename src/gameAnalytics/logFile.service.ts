import {Injectable} from "@nestjs/common";
import * as path from 'path';
import * as fs from 'fs';
import ServiceError from "../common/service/basicService/ServiceError";
import { SEReason } from "../common/service/basicService/SEReason";
import { createClient, WebDAVClient } from "webdav";

@Injectable()
export class LogFileService {
    constructor() {
        this.initializeWebDavClient();
    }
    private client: WebDAVClient;


    //private readonly logFilesRootFolder = 'owncloud/data/altzone/files/log-files';
    private readonly logFilesRootFolder = 'log-files';

    async saveFile(fileToSave: Express.Multer.File, player_id: string){
        try {
            const folderPath = this.getFolderPath();
            const filePath = this.getFilePath(player_id);

            // if (!fs.existsSync(folderPath))
            //   fs.mkdirSync(folderPath, { recursive: true });
            
            // fs.writeFileSync(filePath, fileToSave.buffer);

            await this.client.putFileContents(this.logFilesRootFolder, fileToSave.buffer, {
                overwrite: true,
            });
        } catch (error) {
            return [null, [ new ServiceError({
                reason: SEReason.UNEXPECTED,
                message: 'Unexpected error happen during file saving',
                additional: error
            }) ]];
        }
    }

    initializeWebDavClient() {
        this.client = createClient(
            'http://localhost:8082/remote.php/webdav/',
            {
                username: '',
                password: ''
            },
        );
    }



















    private getFolderPath(){
        const folderName = this.getFolderName();
        return path.join(__dirname, '..', '..', this.logFilesRootFolder, folderName);
    }
    private getFilePath(player_id: string){
        const folderPath = this.getFolderPath();
        const fileName = this.getFileName(player_id);
        return path.join(folderPath, fileName);
    }

    private getFolderName(){
        return this.getDateString();
    }
    private getFileName(player_id: string){
        const dateString = this.getDateString();
        const timeString =  this.getTimeString();
        const randomString = Math.floor(Math.random() * 1000000);

        return `${dateString}_${timeString}_${player_id}_${randomString}.log`;
    }

    private getDateString(){
        const now = new Date();
        return `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    }
    private getTimeString(){
        const now = new Date();
        return `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
    }
}