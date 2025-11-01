const mongoose = require('mongoose');

const { validatePassword, isPasswordHash } = require('../utils/password.js');
const {randomUUID} = require("crypto");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    validate: { validator: isPasswordHash, message: 'Invalid password hash' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  token: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID(),
  },
  // Subscription and Credit Management
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'premium'],
    default: 'free',
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'trial'],
    default: 'active',
  },
  credits: {
    type: Number,
    default: 5, // Free tier gets 5 credits
  },
  creditsUsed: {
    type: Number,
    default: 0,
  },
  subscriptionStartDate: {
    type: Date,
    default: null,
  },
  subscriptionEndDate: {
    type: Date,
    default: null,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
}, {
  versionKey: false,
});

schema.set('toJSON', {
  /* eslint-disable */
  transform: (doc, ret, options) => {
    delete ret._id;
    delete ret.password;
    return ret;
  },
  /* eslint-enable */
});

schema.methods.regenerateToken = async function regenerateToken() {
  this.token = randomUUID();
  if (!this.isNew) {
    await this.save();
  }
  return this;
};

schema.statics.authenticateWithPassword = async function authenticateWithPassword(email, password) {
  const user = await this.findOne({ email }).exec();
  if (!user) return null;

  const passwordValid = await validatePassword(password, user.password);
  if (!passwordValid) return null;

  user.lastLoginAt = Date.now();
  const updatedUser = await user.save();

  return updatedUser;
};

// Credit management methods
schema.methods.hasCredits = function hasCredits(amount = 1) {
  return this.credits >= amount;
};

schema.methods.deductCredits = async function deductCredits(amount = 1) {
  if (!this.hasCredits(amount)) {
    throw new Error('Insufficient credits');
  }
  this.credits -= amount;
  this.creditsUsed += amount;
  await this.save();
  return this;
};

schema.methods.addCredits = async function addCredits(amount) {
  this.credits += amount;
  await this.save();
  return this;
};

schema.methods.resetMonthlyCredits = async function resetMonthlyCredits() {
  const creditLimits = {
    free: 5,
    basic: 50,
    pro: 200,
    premium: 1000,
  };
  this.credits = creditLimits[this.subscriptionPlan] || 5;
  await this.save();
  return this;
};

const User = mongoose.model('User', schema);

module.exports = User;
