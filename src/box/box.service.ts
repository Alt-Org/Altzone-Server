import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Box, publicReferences } from "./schemas/box.schema";
import BasicService from "../common/service/basicService/BasicService";
import { BoxReference } from "./enum/BoxReference.enum";
import { BoxDto } from "./dto/box.dto";
import ServiceError from "../common/service/basicService/ServiceError";
import { SEReason } from "../common/service/basicService/SEReason";
import { ModelName } from "../common/enum/modelName.enum";
import { ObjectId } from "mongodb";
import { JwtService } from "@nestjs/jwt";
import { PlayerDto } from "../player/dto/player.dto";
import { ClaimAccountResponseDto } from "./dto/claimAccountResponse.dto";
import { Tester } from "./schemas/tester.schema";

@Injectable()
export class BoxService {
	public constructor(
		@InjectModel(Box.name) public readonly model: Model<Box>,
		private readonly jwtService: JwtService
	) {
		this.refsInModel = publicReferences;
		this.basicService = new BasicService(model);
	}

	public readonly refsInModel: BoxReference[];
	private readonly basicService: BasicService;

	/**
	 * Retrieves the box with populated testers based on the provided password.
	 *
	 * @param password - The password to authenticate the request.
	 * @returns The box with populated testers.
	 * @throws Will throw an error if the box cannot be found.
	 */
	private async getBoxWithTesters(
		password: string
	): Promise<BoxDto> {
		const [box, errors] = await this.basicService.readOne<BoxDto>(
			{
				filter: { testersSharedPassword: password },
				includeRefs: [...(this.refsInModel as string[] as ModelName[])],
			}
		);
		if (errors) throw errors;
		return box;
	}

	/**
	 * Updates the box with the provided and testers.
	 *
	 * @param box - The box to update.
	 * @throws Will throw an error if the box cannot be updated.
	 */
	async updateBoxIdentifierAndTesters(
		box: BoxDto,
	): Promise<void> {
		const [_, updateErrors] = await this.basicService.updateOneById(box._id, {
			testers: box.testers,
		});
		if (updateErrors) throw updateErrors;
	}

	/**
	 * Claims an account based on the provided password and identifier.
	 *
	 * @param password - The password to authenticate the request.
	 * @param identifier - The identifier to claim the account.
	 * @returns The claimed account data.
	 * @throws Will throw an error if the account cannot be claimed.
	 */
	async claimAccount(password: string): Promise<ClaimAccountResponseDto> {
		const box = await this.getBoxWithTesters(password);
		const testerProfiles = box['TesterProfiles'];
		const testerPlayers = box['TesterPlayers'];

		const account = this.getTesterAccount(box);
		account.isClaimed = true;

		const profile = testerProfiles.find((profile) => {
			return profile._id.toString() === account.profile_id.toString();
		});

		await this.updateBoxIdentifierAndTesters(box);

		const playerData = this.getTesterPlayerData(
			testerPlayers,
			account.player_id
		);

		const accessToken = await this.jwtService.signAsync({
			player_id: account.player_id,
			profile_id: account.profile_id,
		});

        const response: ClaimAccountResponseDto = {
            _id: playerData._id,
            points: playerData.points,
            backpackCapacity: playerData.backpackCapacity,
            above13: playerData.above13,
            parentalAuth: playerData.parentalAuth,
            gameStatistics: playerData.gameStatistics,
            battleCharacter_ids: playerData.battleCharacter_ids,
            currentAvatarId: playerData.currentAvatarId,
            profile_id: account.profile_id.toString(),
            clan_id: playerData.clan_id,
            Clan: playerData.Clan,
            CustomCharacter: playerData.CustomCharacter,
            accessToken: accessToken,
            password: profile.password,
        };

		return response;
	}

	/**
	 * Retrieves the player data for the specified player ID.
	 *
	 * @param players - The list of players.
	 * @param playerId - The ID of the player to retrieve.
	 * @returns The player data excluding specific properties.
	 * @throws Will throw an error if the player cannot be found.
	 */
	private getTesterPlayerData(players: PlayerDto[], playerId: ObjectId): PlayerDto {
		const player = players.find((player) => {
			return player._id.toString() === playerId.toString();
		});

		if (!player) {
			throw new ServiceError({
				reason: SEReason.NOT_FOUND,
				message: "Player not found.",
			});
		}

		return player;
	}

	/**
	 * Retrieves an unclaimed tester account from the box.
	 *
	 * @param box - The box to retrieve the account from.
	 * @returns The unclaimed tester account.
	 * @throws Will throw an error if no unclaimed tester account can be found.
	 */
	private getTesterAccount(box: BoxDto): Tester {
		const account = box.testers.find((tester) => {
			return tester.isClaimed !== true;
		});
		if (!account) {
			throw new ServiceError({
				reason: SEReason.NOT_FOUND,
				message: "All the tester accounts have already been claimed.",
			});
		}
		return account;
	}
}
