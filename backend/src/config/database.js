const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase(uri = env.mongodbUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: !env.isProduction,
    serverSelectionTimeoutMS: 10000,
  });
  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };