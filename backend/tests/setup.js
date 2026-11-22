const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_minimum_32_characters_long';
process.env.COOKIE_SECURE = 'false';

let replSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  // eslint-disable-next-line no-restricted-syntax
  for (const c of collections) {
    // eslint-disable-next-line no-await-in-loop
    await c.deleteMany({});
  }
});