module.exports = {
  createClient: () => ({
    getFileContents: jest.fn(),
    putFileContents: jest.fn(),
    getDirectoryContents: jest.fn(),
  }),
};