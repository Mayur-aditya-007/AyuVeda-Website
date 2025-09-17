// Db Schema
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: Number,
  },
  otpExpires: {
    type: Date,
  },

  // ✅ New fields
  height: {
    type: Number, // in cm
  },
  weight: {
    type: Number, // in kg
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"], // restrict values
  },
  dob: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);
