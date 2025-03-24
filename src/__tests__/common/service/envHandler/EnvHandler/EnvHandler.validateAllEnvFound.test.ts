import { SEReason } from "../../../../../common/service/basicService/SEReason";
import ServiceError from "../../../../../common/service/basicService/ServiceError";
import EnvHandler from "../../../../../common/service/envHandler/envHandler";
import { envVars } from "../../../../../common/service/envHandler/envVars";

describe('EnvHandler.validateAllEnvFound() test suite', () => {
    const envHandler = new EnvHandler();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should throw ServiceError MISCONFIGURED if any of the env vars can not be found from .env', () => {
        const originalValue = envVars.PORT;
        envVars.PORT = undefined;

        const notDefinedVar = () => envHandler.validateAllEnvFound();

        expect(notDefinedVar).toThrow(expect.objectContaining({
            reason: SEReason.MISCONFIGURED, 
            message: 'Can not start the API. One or more of the environment variables is missing from .env file',
            additional: [
                new ServiceError({ 
                    reason: SEReason.MISCONFIGURED, 
                    message: 'EnvHandler: The environment variable PORT is missing or undefined in the .env file. Please add it to the .env file and restart the API',
                    field: 'PORT',
                    value: undefined
                })
            ]
        }));
        envVars.PORT = originalValue;
    });

    it('Should write a message containing name of the missing variable from .env', () => {
        const originalValue = envVars.PORT;
        envVars.PORT = undefined;
        const consoleErrorSpy = jest.spyOn(console, 'error');

        try {
            envHandler.validateAllEnvFound();
        } catch (error) { void error }
        expect(consoleErrorSpy).toHaveBeenCalledWith('EnvHandler: The environment variable PORT is missing or undefined in the .env file. Please add it to the .env file and restart the API');
        envVars.PORT = originalValue;
    });

    it('Should not throw any errors or print anything if all vars are found', () => {
        const originalValue = envVars.PORT;
        envVars.PORT = '8080';
        const consoleErrorSpy = jest.spyOn(console, 'error');

        const allVarsDefined = () => envHandler.validateAllEnvFound();

        expect(allVarsDefined).not.toThrow();
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
        envVars.PORT = originalValue;
    });
});