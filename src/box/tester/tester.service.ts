import {Injectable} from "@nestjs/common";
import {IServiceReturn} from "../../common/service/basicService/IService";
import {ObjectId} from "mongodb";
import {Tester} from "../schemas/tester.schema";

@Injectable()
export class TesterService {

    /**
     * Creates new tester profiles and players.
     *
     * @param amount amount of testers to create.
     *
     * @returns created testers or ServiceError:
     *  - NOT_ALLOWED if the amount is negative number or equals zero
     *  - REQUIRED if the amount is null or undefined
     */
    async createTesters(amount: number): Promise<IServiceReturn<Tester[]>> {
        return null;
    }

    /**
     * Adds testers data to the specified box.
     *
     * Notice that the method will not check the existence of the testers' profiles and players
     *
     * @param box_id _id of the box where the testers data should be registered
     * @param testers testers to register
     *
     * @returns true if the testers were registered or ServiceError:
     *  - REQUIRED if box_id is null, undefined or an empty string, or testers is null, undefined or an empty array
     *  - NOT_FOUND if the box with provided _id is not found
     */
    async addTestersToBox(box_id: ObjectId | string, testers: Tester[]): Promise<IServiceReturn<true>> {
        return null;
    }

    /**
     * Adds testers to clans of the specified box.
     * The testers will be added evenly to clans, so that in the end there will be only the same amount of testers in each clan.
     *
     * Notice that the method does not check the existence of the testers' profiles and players
     *
     * @param box_id box _id where the testers should be added
     * @param testers testers to be added
     *
     * @returns true if the testers were added or ServiceError:
     *  - REQUIRED if box_id is null, undefined or an empty string, or testers is null, undefined or an empty array
     *  - NOT_FOUND if the box with provided _id is not found, or if the box does not have 2 clans
     */
    async addTestersToClans(box_id: ObjectId | string, testers: Tester[]): Promise<IServiceReturn<true>> {
        return null;
    }

    /**
     * Removes the specified amount of tester profiles and players from DB. As well as removes their data from box and clans.
     * The testers will be removed evenly from clans, so that in the end there will be the same amount of testers in each clan.
     *
     * Notice that the method will not remove any other data associated with the testers
     *
     * @param box_id box _id where the testers should be added
     * @param amount amount of testers to be removed
     *
     * @returns created testers or ServiceError:
     *  - NOT_ALLOWED if the amount is negative number or equals zero
     *  - REQUIRED if the box_id is null, undefined or an empty string or if amount is null or undefined
     *  - NOT_FOUND if the box with provided _id is not found, or if the specified amount is larger than the actual amount of testers
     */
    async deleteTesters(box_id: ObjectId | string, amount: number): Promise<IServiceReturn<true>> {
        return null;
    }
}
