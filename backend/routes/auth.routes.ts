import express from "express";
import jwt from "jsonwebtoken";
import { sendOTP, verifyOTP } from "../controllers/verifyOTP";

import bcrypt from "bcryptjs";
import { User } from "../models";
import OTP from "../models/otpModel";
import { checkDB, authenticateToken } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "servesmart-secret-key";

router.post("/send-email-otp", sendOTP);
router.post("/verify-email-otp", verifyOTP);
router.post("/register", checkDB, async (req, res) => {
  const { email, password, displayName, role } = req.body;
  if (!displayName || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });
    const verifiedOTP = await OTP.findOne({ email, isverifiedUser: true });
    if (!verifiedOTP) {
      return res
        .status(400)
        .json({ message: "Email is not verified. Please verify OTP first." });
    }

    await OTP.deleteOne({ email });
    const user = new User({
      email,
      password,
      displayName,
      role,
      verified: true,
    });
    await user.save();

    const userData = user.toJSON();
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: userData });
  } catch (error) {
    res.status(400).json({ message: "Registration failed" });
  }
});

router.post("/login", checkDB, async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userData = user.toJSON();
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
 

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

router.get("/me", checkDB, authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Session check failed" });
  }
});

export default router;
