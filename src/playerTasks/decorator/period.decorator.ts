import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TaskFrequency } from "../enum/taskFrequency.enum";

/**
 * Decorator to get the period query parameter from the request.
 *
 * @param context - The execution context of the request.
 * @returns Task frequency and defaults to daily if period is not provided in the query;
 */
export const Period = createParamDecorator((_, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const period = request.query["period"] ?? "today";

	switch (period) {
		case "week":
			return TaskFrequency.WEEKLY;
		case "month":
			return TaskFrequency.MONTHLY;
		default:
			return TaskFrequency.DAILY;
	}
});
