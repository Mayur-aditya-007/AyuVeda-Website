const User = require("../models/user");
const bcrypt = require("bcrypt");
const { sendOtpEmail } = require("../utils/email");

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not Exists" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.isVerified = false;
    user.otp = otp;
    user.otpExpires = Date.now() + 3600000;
    await user.save();

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "New OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmPassword)
    return res.status(400).json({ message: "All Fields must be filled" });

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email " });
    if (!user || user.otp !== parseInt(otp) || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
