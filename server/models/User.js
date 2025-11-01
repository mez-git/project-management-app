const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'] },
  email: { type: String, required: [true, 'Please add an email'], unique: true, match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] },
  password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false }, // select: false prevents sending password hash by default
  role: { type: String, enum: ['Admin', 'Project Manager', 'Team Member'], default: 'Team Member' },
  createdAt: { type: Date, default: Date.now },
});


UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};


UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);