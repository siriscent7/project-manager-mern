const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(passwordToCheck) {
  return await bcrypt.compare(passwordToCheck, this.password);
};

module.exports = mongoose.model('User', userSchema);