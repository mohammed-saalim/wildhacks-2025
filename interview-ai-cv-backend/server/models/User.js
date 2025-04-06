const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String,
  domain: String,
  skills: [String],
  certifications: [String],
});

module.exports = mongoose.model('User', userSchema);
