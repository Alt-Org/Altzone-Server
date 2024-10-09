import { SEReason } from "../basicService/SEReason";
import ServiceError from "../basicService/ServiceError";
import { envVars } from "./envVars";

/**
 * Class with helper methods for handling .env file
 */
export default class EnvHandler {
    /**
     * Validates the .env file containing all required environment variables
     *
     * @throws _ServiceError_ with status MISCONFIGURED in case some of variables are not found or undefined
     */
    validateAllEnvFound(){
        const errors: ServiceError[] = [];

        Object.keys(envVars).forEach(variable => {
            if (!envVars[variable] || envVars[variable] === undefined) {
                const message = `EnvHandler: The environment variable ${variable} is missing or undefined in the .env file. Please add it to the .env file and restart the API`;
                console.error(message);

                errors.push(new ServiceError({ 
                    reason: SEReason.MISCONFIGURED, 
                    message: message,
                    field: variable,
                    value: envVars[variable]
                }));
            }
        });
        if (errors.length !== 0)
            throw new ServiceError({
                reason: SEReason.MISCONFIGURED, 
                message: 'Can not start the API. One or more of the environment variables is missing from .env file',
                additional: errors
            });
    }
}