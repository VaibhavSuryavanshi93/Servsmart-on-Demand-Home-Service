import { transporter } from "../config/nodemailer.js";
import { generateOTP } from "../config/nodemailer.js";
import OTP from "../models/otpModel.js";
import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
export const sendOTP = async (req, res) => {
  const user = User;
  const { email } = req.body;
  const verifiedUser = await User.findOne({ email, verified: true });
  if (verifiedUser) {
    return res.status(400).json({ message: "User is already verified." });
  }

  try {
    const otp = generateOTP();
    // const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // otpStore[email] = { otp, expiresAt };
    await OTP.create({
      email,
      otp,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Email Verification OTP",
      html: `<h1> ServSmart Home service </h1><br>
      <h3>Your OTP is: <b>${otp}</b></h3>
             <p>Valid for 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  // if (!otpStore[email]) {
  //   return res.status(400).json({ message: "No OTP sent to this email" });
  // }

  // const { otp: storedOtp, expiresAt } = otpStore[email];

  // if (Date.now() > expiresAt) {
  //   delete otpStore[email];
  //   return res.status(400).json({ message: "OTP expired" });
  // }

  // if (storedOtp !== otp) {
  //   return res.status(400).json({ message: "Invalid OTP" });
  // }

  // otpStore[email].verified = true;

  // res.json({ message: "OTP verified successfully" });
  try {
    const existingOTP = await OTP.findOne({ email }).sort({
      createdAt: -1,
    });

    if (!existingOTP) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (existingOTP.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    existingOTP.isverifiedUser = true;
    await existingOTP.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};
