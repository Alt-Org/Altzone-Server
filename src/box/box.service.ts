import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Box, publicReferences } from "./schemas/box.schema";
import BasicService from "../common/service/basicService/BasicService";
import { BoxReference } from "./enum/BoxReference.enum";
import * as crypto from "crypto";
import { BoxDto } from "./dto/box.dto";
import ServiceError from "../common/service/basicService/ServiceError";
import { SEReason } from "../common/service/basicService/SEReason";
import { SessionStage } from "./enum/SessionStage.enum";
import { accountClaimedError } from "./error/accountClaimed.error";
import { ModelName } from "../common/enum/modelName.enum";
import { ObjectId } from "mongodb";
import { JwtService } from "@nestjs/jwt";
import { PlayerDto } from "../player/dto/player.dto";
import { BoxWithPopulatedRefs } from "./types/PopulatedRefs.type";

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
	 * Sets the device identifier based on the user agent and IP address.
	 *
	 * @param userAgent - The user agent string from the request.
	 * @param ip - The IP address from the request.
	 * @param password - The password to authenticate the request.
	 * @returns The generated device identifier.
	 * @throws Will throw an error if the box cannot be found or updated.
	 */
	async setDeviceIdentifier(
		userAgent: string,
		ip: string,
		password: string
	): Promise<string> {
		const [_, errors] = await this.basicService.readOne({
			filter: {
				testersSharedPassword: password,
				sessionStage: SessionStage.TESTING,
			},
		});
		if (errors) throw errors;

		const identifier = this.createDeviceIdentifier(userAgent, ip);
		return identifier;
	}

	/**
	 * Creates a device identifier based on the user agent and IP address.
	 *
	 * @param userAgent - The user agent string from the request.
	 * @param ip - The IP address from the request.
	 * @returns The generated device identifier.
	 */
	private createDeviceIdentifier(userAgent: string, ip: string): string {
		return crypto
			.createHash("sha256")
			.update(`${userAgent}-${ip}`)
			.digest("hex");
	}

	/**
	 * Retrieves the box with populated testers based on the provided password.
	 *
	 * @param password - The password to authenticate the request.
	 * @returns The box with populated testers.
	 * @throws Will throw an error if the box cannot be found.
	 */
	private async getBoxWithTesters(
		password: string
	): Promise<BoxWithPopulatedRefs> {
		const [box, errors] = await this.basicService.readOne<BoxWithPopulatedRefs>(
			{
				filter: { testersSharedPassword: password },
				includeRefs: [...(this.refsInModel as string[] as ModelName[])],
			}
		);
		if (errors) throw errors;
		return box;
	}

	/**
	 * Updates the box with the provided identifier and testers.
	 *
	 * @param box - The box to update.
	 * @param identifier - The identifier to add to the box.
	 * @throws Will throw an error if the box cannot be updated.
	 */
	async updateBoxIdentifierAndTesters(
		box: BoxWithPopulatedRefs,
		identifier: string
	): Promise<void> {
		const [_, updateErrors] = await this.basicService.updateOneById(box._id, {
			$addToSet: { accountClaimersIds: identifier },
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
	async claimAccount(password: string, identifier: string): Promise<any> {
		const box = await this.getBoxWithTesters(password);
		if (box.accountClaimersIds.includes(identifier)) throw accountClaimedError;

		const account = this.getTesterAccount(box);
		account.isClaimed = true;

		const profile = box.TesterProfiles.find((profile) => {
			return profile._id.toString() === account.profile_id.toString();
		});

		await this.updateBoxIdentifierAndTesters(box, identifier);

		const playerData = this.getTesterPlayerData(
			box.TesterPlayers,
			account.player_id
		);

		const accessToken = await this.jwtService.signAsync({
			player_id: account.player_id,
			profile_id: account.profile_id,
		});

		return {
			...playerData,
			profile_id: account.profile_id,
			accessToken,
			password: profile.password,
		};
	}

	/**
	 * Retrieves the player data for the specified player ID.
	 *
	 * @param players - The list of players.
	 * @param playerId - The ID of the player to retrieve.
	 * @returns The player data excluding specific properties.
	 * @throws Will throw an error if the player cannot be found.
	 */
	private getTesterPlayerData(players: PlayerDto[], playerId: ObjectId): any {
		const player = players.find((player) => {
			return player._id.toString() === playerId.toString();
		});

		if (!player) {
			throw new ServiceError({
				reason: SEReason.NOT_FOUND,
				message: "Player not found.",
			});
		}

		// Convert the Mongoose document to a plain JavaScript object
		const playerObject = player.toObject();

		// Exclude specific properties and return the rest
		const { name, uniqueIdentifier, ...data } = playerObject;
		return data;
	}

	/**
	 * Retrieves an unclaimed tester account from the box.
	 *
	 * @param box - The box to retrieve the account from.
	 * @returns The unclaimed tester account.
	 * @throws Will throw an error if no unclaimed tester account can be found.
	 */
	private getTesterAccount(box: BoxDto): any {
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
