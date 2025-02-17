import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Put,
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

@Controller("box")
export class BoxController {
	public constructor(private readonly service: BoxService) {}

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
}
