const express = require("express");
const { signup, verifyOtp, signin, updateProfile } = require("../controllers/authController");
const { forgotPassword, resetPassword } = require("../controllers/forgotPasswordController");
const { handleChat } = require("../controllers/gemini");
const User = require("../models/user");

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
// router.put("/updateprofile/:email", updateProfile);

//get id
router.get("/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Define the chat route
router.post("/chat", handleChat);



module.exports = router;