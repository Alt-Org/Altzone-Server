export default function createMockDataBase() {
  const mockDb = {
    startSession: jest.fn(),
    AbortController: jest.fn(),
    endSession: jest.fn(),
  };

  return mockDb;
}
