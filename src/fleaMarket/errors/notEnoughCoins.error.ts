import { SEReason } from "../../common/service/basicService/SEReason";
import ServiceError from "../../common/service/basicService/ServiceError";

export const notEnoughCoinsError = new ServiceError({
	reason: SEReason.LESS_THAN_MIN,
	message: "Clan does not have enough coins to buy the item",
	field: "gameCoins",
});
