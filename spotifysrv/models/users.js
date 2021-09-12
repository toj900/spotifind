const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    profile: {
      type: String,
      required: true,
      trim: true,
    },
    accessToken: {
        type: String,
        required: true,
        trim: true,
    },
    refreshToken: {
        type: String,
        required: true,
        trim: true,
    },
    expires_in: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) throw new Error("Can store an expired token.");
      },
    },
  });
  
  const User = mongoose.model("User", UserSchema);
  module.exports = User;
