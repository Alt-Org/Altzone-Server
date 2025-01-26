import { APIError } from "../../common/controller/APIError";
import { APIErrorReason } from "../../common/controller/APIErrorReason";

export const noPermissionError = new APIError({
	reason: APIErrorReason.NOT_ALLOWED,
	message: "Logged in user has no permission to read this voting.",
});
