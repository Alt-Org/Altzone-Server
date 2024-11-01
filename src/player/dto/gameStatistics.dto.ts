import {Expose} from "class-transformer";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('GameStatisticsDto')
export class GameStatisticsDto {
    @Expose()
    playedBattles?: number;

	@Expose()
	wonBattles?: number;

	@Expose()
	diamondsAmount?: number;

	@Expose()
	startedVotings?: number;

	@Expose()
	participatedVotings?: number;
}