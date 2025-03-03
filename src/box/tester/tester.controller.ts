import {Body, Controller, Post} from "@nestjs/common";
import {TesterService} from "./tester.service";
import DefineTestersDto from "./dto/define.testers.dto";
import {IsGroupAdmin} from "../auth/decorator/IsGroupAdmin";
import {UniformResponse} from "../../common/decorator/response/UniformResponse";
import {ModelName} from "../../common/enum/modelName.enum";
import {APIError} from "../../common/controller/APIError";
import {APIErrorReason} from "../../common/controller/APIErrorReason";
import {LoggedUser} from "../../common/decorator/param/LoggedUser.decorator";
import {BoxUser} from "../auth/BoxUser";

@Controller('/box/testers')
export class TesterController {
    constructor(private testerService: TesterService) {
    }

    @Post()
    @IsGroupAdmin()
    @UniformResponse(ModelName.BOX)
    async defineTestersAmount(@Body() body: DefineTestersDto, @LoggedUser() user: BoxUser) {
        if (!body.amountToAdd && !body.amountToRemove)
            return [null, [
                new APIError({
                    reason: APIErrorReason.REQUIRED, message: 'One of the amount is required to be set'
                })]];

        if (body.amountToAdd) {
            const [createdTesters, creationErrors] = await this.testerService.createTesters(body.amountToAdd);
            if (creationErrors)
                return [null, creationErrors];

            const [wereAddedToBox, boxAdditionErrors] = await this.testerService.addTestersToBox(user.box_id, createdTesters);
            if (boxAdditionErrors)
                return [null, boxAdditionErrors];

            const [wereAddedToClans, clanAdditionErrors] = await this.testerService.addTestersToClans(user.box_id, createdTesters);
            if (clanAdditionErrors)
                return [null, boxAdditionErrors];
        }

        if (body.amountToRemove) {
            const [wereRemoved, removalErrors] = await this.testerService.deleteTesters(user.box_id, body.amountToRemove);
            if (removalErrors)
                return [null, removalErrors];
        }
    }
}
