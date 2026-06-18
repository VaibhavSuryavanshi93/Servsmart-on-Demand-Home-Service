import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 300 seconds = 5 minutes
  },

  isverifiedUser: {
    type: Boolean,
    default: false,
    DateOfverification: { type: Date, default: Date.now },
  },
});

// MongoDB will automatically delete OTP after 5 minutes

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
