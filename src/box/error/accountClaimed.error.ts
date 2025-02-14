import { SEReason } from "../../common/service/basicService/SEReason";
import ServiceError from "../../common/service/basicService/ServiceError";

export const accountClaimedError = new ServiceError({
	reason: SEReason.NOT_UNIQUE,
	message: "Account already claimed",
});
