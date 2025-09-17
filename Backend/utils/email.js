const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

exports.sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Verify Your Email",
    text: `Your OTP is ${otp}. It expires in 1 hour.`,
  });
};
