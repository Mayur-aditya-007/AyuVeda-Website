const express = require("express");
const { signup, verifyOtp, signin } = require("../controllers/authController");
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/forgotPasswordController");
const { updateProfile } = require("../controllers/authController"); // Import updateProfile

const router = express.Router();

// auth routes
router.post("/signup", signup);
router.post("/verifyotp", verifyOtp);
router.post("/signin", signin);

// password routes
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);

// update profile routes (note: this should probably be a PUT request and include :id param)
router.put("/updateprofile/:id", updateProfile);

module.exports = router;