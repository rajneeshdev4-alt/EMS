const User = require('./user.model');

async function listUsers() {
  return User.find().select('name email role isActive createdAt').lean();
}

module.exports = { listUsers };