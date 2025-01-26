import { getTimeSince, passed } from "../../../../common/function/timeUtils";

describe('timeUtils test suite', () => {
    describe('getTimeSince()', () => {
        it('Should return the correct elapsed time since the timestamp', () => {
            const now = Date.now();
            const pastTime = now - 1000; // 1 second in the past
            const result = getTimeSince(pastTime);
            expect(result).toBeGreaterThanOrEqual(1000);
        });
    
        it('Should return a small number when timestamp is very recent', () => {
            const now = Date.now();
            const result = getTimeSince(now);
            expect(result).toBeGreaterThanOrEqual(0);
        });
    });

    describe('passed()', () => {
        it('Should return true if the specified time has passed since the timestamp', () => {
            const now = Date.now();
            const pastTime = now - 2000; // 2 seconds in the past
            const result = passed(pastTime, 1000); // Check if 1 second has passed
            expect(result).toBe(true);
        });
    
        it('Should return false if the specified time has not passed since the timestamp', () => {
            const now = Date.now();
            const pastTime = now - 500; // 0.5 seconds in the past
            const result = passed(pastTime, 1000); // Check if 1 second has passed
            expect(result).toBe(false);
        });
    
        it('Should return true if the exact time has passed', () => {
            const now = Date.now();
            const pastTime = now - 1000; // 1 second in the past
            const result = passed(pastTime, 1000); // Check if 1 second has passed
            expect(result).toBe(true);
        });
    });
});