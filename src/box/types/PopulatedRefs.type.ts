import { PlayerDto } from "../../player/dto/player.dto";
import { Profile } from "../../profile/profile.schema";
import { BoxDto } from "../dto/box.dto";

export interface BoxWithPopulatedRefs extends BoxDto {
	TesterPlayers: PlayerDto[];
	TesterProfiles: Profile[];
}
