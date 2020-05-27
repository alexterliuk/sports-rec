const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 6,
    maxLength: 20,
    validate(value) {
      return value.split('').every(char => char.search(/\w/) !== -1);
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
}, {
  timeStamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
