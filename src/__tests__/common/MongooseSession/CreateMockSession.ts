export default function createMockSession(model) {
  const sessionMock = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };
  jest.spyOn(model.db, 'startSession').mockResolvedValue(sessionMock);

  return sessionMock;
}
