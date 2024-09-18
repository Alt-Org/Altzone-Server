import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Game } from './game.schema';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { CreateGameDto } from './dto/createGame.dto';
import { PlayerService } from '../player/player.service';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { JwtService } from '@nestjs/jwt';
import { ClanService } from '../clan/clan.service';
import { RoomService } from '../room/room.service';
import { ModelName } from '../common/enum/modelName.enum';
import { BattleResultDto } from './dto/battleResult.dto';
import { User } from '../auth/user';

@Injectable()
export class GameDataService {
	constructor(
		@InjectModel(Game.name) public readonly model: Model<Game>,
		@Inject(forwardRef(() => PlayerService)) public readonly playerService: PlayerService,
		@Inject(forwardRef(() => ClanService)) public readonly clanService: ClanService,
		@Inject(forwardRef(() => RoomService)) public readonly roomService: RoomService,
		private readonly jwtService: JwtService,
	){
		this.basicService = new BasicService(model);
		this.refsInModel = [ModelName.STOCK];
        this.modelName = ModelName.ITEM;
	}

	public readonly basicService: BasicService;
	public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

	async createOne(game: CreateGameDto) {
		return await this.basicService.createOne<CreateGameDto, Game>(game)
	}

	async saveNewGame(body: BattleResultDto, team1Id: string, team2Id: string, currentTime: Date) {
		const newGame: CreateGameDto = {
			team1: body.team1,
			team2: body.team2,
			team1Clan: team1Id,
			team2Clan: team2Id,
			winner: body.winnerTeam,
			startedAt: new Date(currentTime.getTime() - body.duration * 1000),
			endedAt: currentTime
		}
		return await this.createOne(newGame);
	}

	async generateResponse(body: BattleResultDto, team1ClanId: string, team2ClanId: string, user: User) {
		const [clan, errors] = await this.clanService.readOneById(body.winnerTeam === 1 ? team2ClanId : team1ClanId, { includeRefs: [ModelName.SOULHOME] });
		if (errors) {
			return [null, errors]
		}
		const [roomIds, roomErrors] = await this.getRoomIds(clan.SoulHome._id);
		if (roomErrors) {
			return [null, errors]
		}

		const stealToken = await this.generateStealToken(user.player_id, clan.SoulHome._id);
		const response = {
			stealToken,
			SoulHome_id: clan.SoulHome._id,
			roomIds
		}
		return [response, null]
	}

	async handleBattleResult(body: BattleResultDto, user: User) {
		const currentTime = new Date();

		const [teamIds, teamIdsErrors] = await this.getClanIdForTeams([body.team1[0], body.team2[0]]);
		if (teamIdsErrors)
			return [null, teamIdsErrors]

		const team1ClanId = teamIds.team1Id;
		const team2ClanId = teamIds.team2Id;
		
		const existingGame = await this.gameAlreadyExists(body.team1, body.team2, currentTime);
		if (!existingGame) {
			const [game, createGameErrors] = await this.saveNewGame(body, team1ClanId, team2ClanId, currentTime)
			if (createGameErrors)
				return [null, createGameErrors]
		}

		const winningTeam = body.winnerTeam === 1 ? body.team1 : body.team2;
		const playerInWinningTeam = winningTeam.includes(user.player_id);
		
		if (playerInWinningTeam)
			return await this.generateResponse(body, team1ClanId, team2ClanId, user)

		return [null, new ServiceError({ reason: SEReason.NOT_ALLOWED })]
	}

	async gameAlreadyExists(team1: string[], team2: string[], currentTime: Date) {
		const game = await this.model.findOne({
			team1: { $all: team1 },
			team2: { $all: team2 },
		}).sort({ endedAt: -1 }).exec();

		if (!game)
			return false;

		if (game.endedAt.getTime() < currentTime.getTime() - 30 * 1000)
			return false;

		return true
	}

	async getClanIdForTeams(playerIds: string[]): Promise<[{team1Id: string, team2Id: string}, ServiceError[]]> {
		const [team1Player, team1Errors] = await this.playerService.getPlayerById(playerIds[0])
		if (team1Errors)
			return [null, team1Errors]

		const [team2Player, team2Errors] = await this.playerService.getPlayerById(playerIds[1])
		if (team2Errors)
			return [null, team2Errors]

		const clanIds = {
			team1Id: team1Player.clan_id.toString(),
			team2Id: team2Player.clan_id.toString()
		}
			return [clanIds, null]
	}

	async generateStealToken(playerId: string, soulHomeId: string) {
		return await this.jwtService.signAsync(
			{
				playerId,
				soulHomeId,
			}, 
			{ 
				expiresIn: '15m' 
			});
	}

	async getRoomIds(soulHomeId: string): Promise<[string[], ServiceError[]]> {
		const [rooms, roomErrors] = await this.roomService.readAllSoulHomeRooms(soulHomeId);
		if (roomErrors) {
			console.log("getRoomIds:", roomErrors)
			return [null, roomErrors]
		}

		const roomIds = rooms.map((room) => room._id);
		return [roomIds, null];
	}
}
