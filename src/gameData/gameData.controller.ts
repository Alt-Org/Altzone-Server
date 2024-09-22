import { Body, Controller, ForbiddenException, HttpException, Post } from '@nestjs/common';
import { GameDataService } from './gameData.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import { validate } from 'class-validator';
import { RequestType } from './enum/requestType.enum';
import { RequestTypeDto } from './dto/resultType.dto';

@Controller('gameData')
export class GameDataController {
	constructor(
		private readonly service: GameDataService,
	){}

	@Post('battle')
	@UniformResponse()
	async handleBattleResult(@Body() body: any, @LoggedUser() user: User) {
		const typeDto = new RequestTypeDto
		typeDto.type = body.type
		const errors = await validate(typeDto);
		if (errors.length > 0)
			return new APIError({ reason: APIErrorReason.VALIDATION });

		switch (typeDto.type) {
			case RequestType.RESULT:
				return await this.service.handleResultType(body, user)
			default:
				return new APIError({ reason: APIErrorReason.BAD_REQUEST })
		}
	} 
}
