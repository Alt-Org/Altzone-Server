import generateClanNames from "../../../box/util/generateClanNames";

describe('generateClanNames() test suite', () => {
    it('Should generate valid clan names with the specified unique value in the start', () => {
        const uniqueValue = 'John';
        const expectedNames = [
            `${uniqueValue} clan 1`,
            `${uniqueValue} clan 2`
        ];

        const actualNames = generateClanNames(uniqueValue, 2);
        expect(actualNames).toEqual(expectedNames);
    });

    it('Should generate specified amount of names', () => {
        const requiredAmount1 = 2;
        const names1 = generateClanNames('value', requiredAmount1);
        expect(names1).toHaveLength(requiredAmount1);

        const requiredAmount2 = 10;
        const names2 = generateClanNames('value', requiredAmount2);
        expect(names2).toHaveLength(requiredAmount2);
    });
});