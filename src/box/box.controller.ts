import {
	Body,
	Controller,
	Get,
	Headers,
	Ip,
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
import { UniformResponse } from "../common/decorator/response/UniformResponse";

@Controller("box")
export class BoxController {
	public constructor(private readonly service: BoxService) {}

	@NoAuth()
	@Get("identifier")
	@UniformResponse()
	async getDeviceIdentifier(
		@Query("password") password: string,
		@Headers("user-agent") userAgent: string,
		@Ip() ip: string,
		@Res({ passthrough: true }) res: Response
	) {
		const deviceIdentifier = await this.service.setDeviceIdentifier(
			userAgent,
			ip,
			password
		);
		res.cookie("deviceIdentifier", deviceIdentifier);
	}

	@NoAuth()
	@Get("claim-account")
	@UniformResponse()
	async claimAccount(@Req() req: Request, @Query("password") password: string) {
		const { deviceIdentifier } = req.cookies;
		return this.service.claimAccount(password, deviceIdentifier);
	}
}
