const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // Basic Account Info
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

  // Verification & Security
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

  // Personal / Physical Information
  height: {
    type: Number, // in cm
  },
  weight: {
    type: Number, // in kg
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  dob: {
    type: Date,
  },

  
  profilePicture: {
    type: String, 
    default: "",  
  },
});

module.exports = mongoose.model("User", UserSchema);
