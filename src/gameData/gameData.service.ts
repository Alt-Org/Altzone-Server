import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Game } from './game.schema';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { CreateGameDto } from './dto/createGame.dto';
import { PlayerService } from '../player/player.service';
import ServiceError from '../common/service/basicService/ServiceError';
import { JwtService } from '@nestjs/jwt';
import { ClanService } from '../clan/clan.service';
import { RoomService } from '../room/room.service';
import { ModelName } from '../common/enum/modelName.enum';
import { BattleResultDto } from './dto/battleResult.dto';
import { User } from '../auth/user';
import { GameDto } from './dto/game.dto';
import { BattleResponseDto } from './dto/battleResponse.dto';

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

	/**
	 * Creates a new game in DB.
	 * 
	 * @param game - Game data to create
     * @returns created Item or an array of service errors if any occurred.
	 */
	async createOne(game: CreateGameDto) {
		return await this.basicService.createOne<CreateGameDto, GameDto>(game)
	}

	/**
	 * Creates a new game object based on the provided battle result and team information.
	 * 
	 * @param body - The battle result data transfer object containing details of the battle.
	 * @param team1Id - The identifier for team 1's clan.
	 * @param team2Id - The identifier for team 2's clan.
	 * @param currentTime - The current date and time when the game is being created.
	 * @returns A new game data transfer object ready to be saved in the database.
	 */
	createNewGameObject(body: BattleResultDto, team1Id: string, team2Id: string, currentTime: Date) {
		const newGame: CreateGameDto = {
			team1: body.team1,
			team2: body.team2,
			team1Clan: team1Id,
			team2Clan: team2Id,
			winner: body.winnerTeam,
			startedAt: new Date(currentTime.getTime() - body.duration * 1000),
			endedAt: currentTime
		}
		return newGame
	}

	/**
	 * Generates a response for the battle result, including a steal token, SoulHome ID, and room IDs.
	 * 
	 * @param body - The battle result data transfer object.
	 * @param team1ClanId - The identifier for team 1's clan.
	 * @param team2ClanId - The identifier for team 2's clan.
	 * @param user - The user who is submitting the battle result.
	 * @returns - A promise that resolves to an array containing the response object and any service errors.
	 */
	async generateResponse(body: BattleResultDto, team1ClanId: string, team2ClanId: string, user: User): Promise<[BattleResponseDto, ServiceError[]]> {
		const [clan, errors] = await this.clanService.readOneById(body.winnerTeam === 1 ? team2ClanId : team1ClanId, { includeRefs: [ModelName.SOULHOME] });
		if (errors) {
			return [null, errors]
		}
		const [roomIds, roomErrors] = await this.getRoomIds(clan.SoulHome._id);
		if (roomErrors) {
			return [null, errors]
		}

		const stealToken = await this.generateStealToken(user.player_id, clan.SoulHome._id);
		const response: BattleResponseDto = {
			stealToken,
			SoulHome_id: clan.SoulHome._id,
			roomIds
		}
		return [response, null]
	}

	/**
	 * Checks if a game with given information exists in DB.
	 * 
	 * This function uses data from the client request which doesn't
	 * include any uniquely identifiable data. This is why the function
	 * tries to find the latest game between these teams and if the
	 * game found is older then 30 seconds it returns false.
	 * This number can be changed based on how long the games and 
	 * requests from the client to server take.
	 * 
	 * @param team1 - Player ids of team1 players
	 * @param team2 - Player ids of team2 players
	 * @param currentTime - Current time
	 * @returns - Returns a promise that resolves to true in a game exists, otherwise false
	 */
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

	/**
	 * Retrieves the clan IDs for the given player IDs.
	 * 
	 * @param playerIds - An array containing the player IDs of the first player from each team.
	 * @returns - A promise that resolves to an object containing the clan IDs for both teams and any service errors.
	 */
	async getClanIdForTeams(playerIds: string[]): Promise<[{team1Id: string, team2Id: string}, ServiceError[]]> {
		const [team1Player, team1Errors] = await this.playerService.getPlayerById(playerIds[0]);
		if (team1Errors) {
			return [null, team1Errors];
		}
	
		const [team2Player, team2Errors] = await this.playerService.getPlayerById(playerIds[1]);
		if (team2Errors) {
			return [null, team2Errors];
		}
	
		const clanIds = {
			team1Id: team1Player.clan_id.toString(),
			team2Id: team2Player.clan_id.toString()
		};
		return [clanIds, null];
	}


	/**
	 * Generates a steal token for a winning player.
	 * 
	 * @param playerId - The ID of the winning player.
	 * @param soulHomeId - The ID of the losing team SoulHome.
	 * @returns - A promise that resolves to the generated steal token.
	 */
	async generateStealToken(playerId: string, soulHomeId: string): Promise<string> {
		return await this.jwtService.signAsync(
			{ playerId, soulHomeId },
			{ expiresIn: '15m' }
		);
	}

	/**
	 * Retrieves the IDs of all rooms associated with a given SoulHome.
	 * 
	 * @param soulHomeId - The ID of the SoulHome.
	 * @returns - A promise that resolves to an array containing the room IDs and any service errors.
	 */
	async getRoomIds(soulHomeId: string): Promise<[string[], ServiceError[]]> {
		const [rooms, roomErrors] = await this.roomService.readAllSoulHomeRooms(soulHomeId);
		if (roomErrors) {
			console.log("getRoomIds:", roomErrors);
			return [null, roomErrors];
		}

		const roomIds = rooms.map((room) => room._id);
		return [roomIds, null];
	}

	/**
	 * Checks if a game already exists and creates a new game if not.
	 * 
	 * @param body - The battle result data transfer object.
	 * @param teamIds - The clan IDs for both teams.
	 * @param currentTime - The current time.
	 */
	async createGameIfNotExists(body: BattleResultDto, teamIds: { team1Id: string, team2Id: string }, currentTime: Date) {
		const existingGame = await this.gameAlreadyExists(body.team1, body.team2, currentTime);
		if (!existingGame) {
			const newGame = this.createNewGameObject(body, teamIds.team1Id, teamIds.team2Id, currentTime);
			const [_, createGameErrors] = await this.createOne(newGame);
			if (createGameErrors)
				console.error("Error creating new game:", createGameErrors)
		}
	}
}