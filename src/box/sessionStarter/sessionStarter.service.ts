import {Injectable} from "@nestjs/common";
import {ObjectId} from "mongodb";
import {IServiceReturn} from "../../common/service/basicService/IService";

/**
 * Class responsible for starting the testing session process.
 */
@Injectable()
export default class SessionStarterService {

    /**
     * Starts a testing session which means:
     * - Creates predefined daily tasks for each clan
     * - Defines clan admins from the testers
     * - Generates and sets testers shared password
     * - Sets testing session stage to TESTING
     * - Sets reset and removal times of the box
     *
     * @param box_id _id of the box where to start the session
     *
     * @returns true if the session is started successfully, or ServiceErrors:
     * - REQUIRED if the box_id is not provided
     * - NOT_FOUND if the box with that _id does not exist
     */
    async start(box_id: ObjectId | string): Promise<IServiceReturn<true>> {
        return null;
    }
}
