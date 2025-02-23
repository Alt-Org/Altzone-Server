import {
    Body,
    Controller, Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
} from "@nestjs/common";
import { BoxService } from "./box.service";
import { Request, Response } from "express";
import { NoAuth } from "../auth/decorator/NoAuth.decorator";
import { Serialize } from "../common/interceptor/response/Serialize";
import { ClaimAccountResponseDto } from "./dto/claimAccountResponse.dto";
import { APIError } from "../common/controller/APIError";
import { APIErrorReason } from "../common/controller/APIErrorReason";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import BoxCreator from "./boxCreator";
import BoxAuthHandler from "./auth/BoxAuthHandler";
import {CreatedBoxDto} from "./dto/createdBox.dto";
import {ModelName} from "../common/enum/modelName.enum";
import {CreateBoxDto} from "./dto/createBox.dto";
import {IncludeQuery} from "../common/decorator/param/IncludeQuery.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {publicReferences} from "./schemas/box.schema";

@Controller('box')
export class BoxController {
    public constructor(
        private readonly service: BoxService,
        private readonly boxCreator: BoxCreator,
        private readonly authHandler: BoxAuthHandler
    ) {
    }

	@NoAuth()
	@Get("claim-account")
	@UniformResponse()
	@Serialize(ClaimAccountResponseDto)
	async claimAccount(
		@Req() req: Request,
		@Res() res: Response,
		@Query("password") password: string
	) {
		const { accountClaimed } = req.cookies;
		if (accountClaimed)
			throw new APIError({
				reason: APIErrorReason.NOT_AUTHORIZED,
				message: "Account already claimed from this device.",
			});

		const data = await this.service.claimAccount(password);
		res.cookie("accountClaimed", true, { httpOnly: false, maxAge: 15 * 60 * 1000 });
		return res.send(data);
	}

    @NoAuth()
    @Post()
    @Serialize(CreatedBoxDto)
    @UniformResponse(ModelName.BOX)
    async createBox(@Body() body: CreateBoxDto) {
        const [createdBox, errors] = await this.boxCreator.createBox(body);
        if (errors)
            return [null, errors];

        const groupAdminAccessToken = await this.authHandler.getGroupAdminToken({
            box_id: createdBox._id.toString(),
            player_id: createdBox.adminPlayer_id.toString(),
            profile_id: createdBox.adminProfile_id.toString()
        });

        return [{...createdBox, accessToken: groupAdminAccessToken}, null];
    }

    //For time of development only
    @NoAuth()
    @Get('/:_id')
    @NoAuth()
    @UniformResponse(ModelName.BOX)
    public getOne(@Param() param: _idDto, @IncludeQuery(publicReferences as any) includeRefs: ModelName[]) {
        return this.service.readOneById(param._id, { includeRefs });
    }

    //For time of development only
    @NoAuth()
    @Delete('/:_id')
    @UniformResponse(ModelName.BOX)
    async deleteBox(@Param() param: _idDto) {
        const [isSuccess, errors] = await this.service.deleteOneById(param._id);

        if (errors)
            return [null, errors];
    }
}
