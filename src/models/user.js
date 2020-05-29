const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { containsOnlyLetNumUnderscore } = require('../utils/check-string');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 20,
    validate(name) {
      const valid = containsOnlyLetNumUnderscore(name);

      if (!valid) {
        throw new Error('Name cannot contain characters other than letters, numbers, or _.');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
}, {
  timeStamps: true,
});

// Create token for authentication
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Strip sensitive info from user before sending to client
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Find user by name and authorization token
userSchema.statics.findByCredentials = async (name, password) => {
  const user = await User.findOne({ name });

  const isMatch = await bcrypt.compare(password, (user || {}).password);
  if (!isMatch) throw new Error('Unable to sign in.');

  return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
