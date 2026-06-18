import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});
export const sendServiceStatusEmail = async (
  to,
  serviceName,
  status,
  reason,
) => {
  const subject =
    status === "approved"
      ? "✅ Your service was approved"
      : "❌ Your service was rejected";

  const text =
    status === "approved"
      ? `Your service "${serviceName}" is now approved and visible to users.`
      : `Your service "${serviceName}" was rejected.\nReason: ${reason || "Not specified"}`;

  await transporter.sendMail({
    from: `"Service App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// export const otpStore = {};

export const generateReferral = (username) => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return username.substring(0, 3).toUpperCase() + random;
};
