import { SEReason } from "../../common/service/basicService/SEReason";
import ServiceError from "../../common/service/basicService/ServiceError";

export const alreadyVotedError = new ServiceError({
	reason: SEReason.NOT_ALLOWED,
	message: "Logged in user has already voted.",
});
