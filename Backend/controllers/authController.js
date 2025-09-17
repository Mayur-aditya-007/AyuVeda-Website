const bcrypt = require("bcrypt");
const { sendOtpEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");
const User = require("../models/user");


// ✅ Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { height, weight, gender, dob } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { height, weight, gender, dob },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};



//SignUp APi
exports.signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return res.status(400).json({ message: "All Fields must be filled" });
  if (password !== confirmPassword)
    return res.status(400).json({ message: "Password do not match" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = Date.now() + 3600000;

    const newUSer = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    await newUSer.save();

    await sendOtpEmail(email, otp);
    res.status(201).json({
      message: "User registered. Check your mail to verify OTP.",
      otp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message /* otp: otp */ });
  }
};

//VerifyOTP APi
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(201).json({ message: "Missing OTP or Email" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== parseInt(otp) || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//SignIn APi
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not Found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    if (!user.isVerified)
      return res.status(400).json({ message: "User is not verified" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token, name: user.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
