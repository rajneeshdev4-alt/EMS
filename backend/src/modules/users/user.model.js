const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../../config/env');
const { ROLES } = require('../../constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

const User = mongoose.model('User', userSchema);

module.exports = User;