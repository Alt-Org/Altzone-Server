import { getNonExisting_id } from "../../util/getNonExisting_id";

describe('getNonExisting_id() test suite', () => {
    it('Should replace 3 first characters with zeros', () => {
        const normal_id = '668a70ce91020196cb10d595';

        const result = getNonExisting_id(normal_id);

        expect(result).toBe('000a70ce91020196cb10d595');
    });

    it('Should replace 3 first characters with ones if the first three characters are already zeros', () => {
        const _idWithZeros = '000a70ce91020196cb10d595';

        const result = getNonExisting_id(_idWithZeros);

        expect(result).toBe('111a70ce91020196cb10d595');
    });

    it('Should throw TypeError if provided param is not mongo _id', () => {
        const invalidParam = 'zp-a70ce91020196cb10d5sg';

        const notValidCall = () => getNonExisting_id(invalidParam);

        expect(notValidCall).toThrow(TypeError);
    });
});