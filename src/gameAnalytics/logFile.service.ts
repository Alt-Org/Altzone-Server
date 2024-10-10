import {Injectable} from "@nestjs/common";
import ServiceError from "../common/service/basicService/ServiceError";
import { SEReason } from "../common/service/basicService/SEReason";
import { createClient, WebDAVClient } from "webdav";
import { envVars } from "../common/service/envHandler/envVars";

@Injectable()
export class LogFileService {
    constructor() {
        this.initializeWebDavClient();
    }
    private client: WebDAVClient;

    private readonly logFilesRootFolder = envVars.OWNCLOUD_LOG_FILES_ROOT;

    /**
     * Saves the provided file to the own cloud via WebDAV in the designated folder.
     * 
     * @param fileToSave - The file to save.
     * @param player_id - The player's unique identifier to be included in the file name.
     * @param battleId - The battle id to which battle belongs to
     * @returns A tuple with first element set to _true_ if file was saved 
     *
     *          or _array of ServiceErrors_ as a second element
     */
    async saveFile(fileToSave: Express.Multer.File, player_id: string, battleId?: string){
        if(!battleId)
            battleId = Date.now().toString();
        const folderPath = this.getFolderPath(battleId);
        const filePath = this.getFilePath(battleId, player_id);

        try {
            const isFileFolderExist = await this.client.exists(folderPath);
            if(!isFileFolderExist)
                //Notice that the "logFilesRootFolder" folder must be already created manually in own cloud
                await this.client.createDirectory(folderPath, {recursive: true});
        } catch (error) {
            return [null, [ 
                new ServiceError({
                    reason: SEReason.UNEXPECTED,
                    message: 'Unexpected error happen during folder creation',
                    additional: this.getWebDavErrorData(error)
                }) 
            ]];
        }

        try {
            const isSuccess = await this.client.putFileContents(filePath, fileToSave.buffer, {
                overwrite: true
            });

            if(!isSuccess)
                return [ null, [
                    new ServiceError({
                        reason: SEReason.UNEXPECTED, 
                        message: 'Could not save the log file'
                    }) 
                ]];

            return [true, null];
        } catch (error: any) {
            return [null, [ 
                new ServiceError({
                    reason: SEReason.UNEXPECTED,
                    message: 'Unexpected error happen during file saving',
                    additional: this.getWebDavErrorData(error)
                }) 
            ]];
        }
    }

    /**
     * Initializes the WebDAV client using credentials from the environment variables.
     */
    private initializeWebDavClient() {
        this.client = createClient(
            `http://${envVars.OWNCLOUD_HOST}:${envVars.OWNCLOUD_PORT}/remote.php/webdav/`,
            {
                username: envVars.OWNCLOUD_USER,
                password: envVars.OWNCLOUD_PASSWORD
            }
        );
    }

    /**
     * Extracts the error data from the WebDAV error response.
     * 
     * @param error - The error object to extract information from.
     * @returns The response data from the WebDAV error, or null if not available.
     */
    private getWebDavErrorData(error: any){
        return error?.response?.data ?? null;
    }

    /**
     * Constructs the full path to the folder where log files will be stored.
     * 
     * @param battleId - The id of the battle where file belongs to
     * @returns The full folder path as a string.
     */
    private getFolderPath(battleId: string){
        const folderDataName = this.getDateFolderName();
        return `${this.logFilesRootFolder}/${folderDataName}/${battleId}`;
    }
    /**
     * Constructs the full path to the file, including the folder and the file name.
     * 
     * @param battleId - The id of the battle where file belongs to
     * @param player_id - The player's unique identifier to be included in the file name.
     * @returns The full file path.
     */
    private getFilePath(battleId: string, player_id: string){
        const folderPath = this.getFolderPath(battleId);
        const fileName = this.getFileName(player_id);
        return `${folderPath}/${fileName}`;
    }

    /**
     * Generates a folder name based on the current date.
     * 
     * @returns A string representing the folder name, formatted as DD-MM-YYYY.
     */
    private getDateFolderName(){
        return this.getDateString();
    }
    /**
     * Generates a file name based on the current date, time, player _id, and a random string.
     * 
     * @param player_id - The player's unique identifier to be included in the file name.
     * @returns The file name as a string, formatted as DD-MM-YYYY_HH-MM-SS_playerID_random.log.
     */
    private getFileName(player_id: string){
        const dateString = this.getDateString();
        const timeString =  this.getTimeString();
        const randomString = Math.floor(Math.random() * 1000000);

        return `${dateString}_${timeString}_${player_id}_${randomString}.log`;
    }

    /**
     * Gets the current date as a string formatted as DD-MM-YYYY.
     * 
     * @returns A string representing the current date.
     */
    private getDateString(){
        const now = new Date();
        return `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    }
    /**
     * Gets the current time as a string formatted as HH-MM-SS.
     * 
     * @returns A string representing the current time.
     */
    private getTimeString(){
        const now = new Date();
        return `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
    }
}