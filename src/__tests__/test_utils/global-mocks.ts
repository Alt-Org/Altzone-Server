jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      close: jest.fn(),
      // Add other methods if needed
    })),
    Worker: jest.fn().mockImplementation(() => ({
      close: jest.fn(),
      on: jest.fn(),
    })),
    QueueScheduler: jest.fn().mockImplementation(() => ({
      close: jest.fn(),
    })),
  };
});

jest.mock('mqtt', () => {
  return {
    connect: jest.fn(() => ({
      publish: jest.fn(),
      publishAsync: jest.fn(),
      subscribe: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
    })),
  };
});
