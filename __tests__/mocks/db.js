// Mock database connection pool
const mockExecute = jest.fn();
const mockRelease = jest.fn();
const mockGetConnection = jest.fn().mockResolvedValue({
  execute: mockExecute,
  release: mockRelease,
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
});

const pool = {
  getConnection: mockGetConnection,
  execute: mockExecute,
};

module.exports = { pool, mockExecute, mockRelease, mockGetConnection };
