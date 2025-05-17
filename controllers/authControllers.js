const jwt = require("jsonwebtoken");
const { db } = require("../config/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});
const sendEmail = async ({ to, subject, html, text }) => {
  console.log("from:", process.env.NODEMAILER_EMAIL);
  try {
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent successfully!", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const generateToken = (user) =>
  jwt.sign(
    { email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );

const authLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const authSignup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await db.collection("users").findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      email,
      password: hashed,
      role: "user",
      createdAt: new Date(),
    };
    await db.collection("users").insertOne(user);
    res.status(200).json({ message: "User registered" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const GoogleUser = async (req, res) => {
  try {
    const { email, name, image } = req.body;
    let user = await db.collection("users").findOne({ email });
    if (!user) {
      user = {
        email,
        name,
        image,
        role: "user",
        createdAt: new Date(),
      };
      const result = await db.collection("users").insertOne(user);
      user._id = result.insertedId;
    }

    const token = generateToken(user);

    res.json({
      message: "Google login successful",
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const ifExistingUser = await db
      .collection("users")
      .findOne({ email: email });
    if (!ifExistingUser) {
      return res.status(400).json({ message: "User not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 hour
    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpires,
        },
      }
    );
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
    console.log(ifExistingUser.email);

    const emailPayload = {
      to: ifExistingUser.email,
      subject: "FMLIO Password Reset Request",
      html: `
      <div style="max-width:480px;margin:0 auto;font-family:sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <div style="background:#ff7300;padding:24px 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:2rem;letter-spacing:2px;">fmlio</h1>
        </div>
        <div style="padding:32px 24px 24px 24px;background:#fff;">
        <h2 style="color:#222;margin-top:0;">Reset Your Password</h2>
        <p style="color:#444;font-size:1rem;">We received a request to reset your password for your fmlio account.</p>
        <p style="color:#444;font-size:1rem;">Click the button below to reset your password. This link will expire in 1 hour.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="background:#ff7300;color:#fff;text-decoration:none;padding:14px 32px;border-radius:5px;font-size:1.1rem;display:inline-block;font-weight:bold;">Reset Password</a>
        </div>
        <p style="color:#888;font-size:0.95rem;">If you did not request a password reset, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px 0;">
        <p style="color:#aaa;font-size:0.85rem;text-align:center;">&copy; ${new Date().getFullYear()} fmlio. All rights reserved.</p>
        </div>
      </div>
      `,
    };
    try {
      const emailResponse = await sendEmail(emailPayload);
      return res.send({
        message: "Email sent successfully!",
        status: 200,
      });
    } catch (e) {
      console.log("Error sending email:", e);
    }

    console.log("Email sent successfully!");
    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.log(err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await db.collection("users").findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    console.log("hello", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: { password: hashed },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
      }
    );
    const emailPayload = {
      to: user.email,
      subject: "FMLIO Password Reset Successful",
      html: `
      <div style="max-width:480px;margin:0 auto;font-family:sans-serif;border:1px solid #eee;border-radius:8px;overflow:hidden;">
      <div style="background:#ff7300;padding:24px 0;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:2rem;letter-spacing:2px;">fmlio</h1>
      </div>
      <div style="padding:32px 24px 24px 24px;background:#fff;">
      <h2 style="color:#222;margin-top:0;">Password Reset Successful</h2>
      <p style="color:#444;font-size:1rem;">Your password has been successfully reset for your fmlio account.</p>
      <p style="color:#444;font-size:1rem;">You can now <a href="http://localhost:3000/auth/login" style="color:#ff7300;text-decoration:underline;">login to your account</a> with your new password.</p>
      <p style="color:#444;font-size:1rem;">If you did not perform this action, please contact our support immediately.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px 0;">
      <p style="color:#aaa;font-size:0.85rem;text-align:center;">&copy; ${new Date().getFullYear()} fmlio. All rights reserved.</p>
      </div>
      </div>
      `,
    };

    try {
      const emailResponse = await sendEmail(emailPayload);
      return res.send({
        message: "Email sent successfully!",
        status: 200,
      });
    } catch (e) {
      console.log("Error sending email:", e);
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  authLogin,
  authSignup,
  GoogleUser,
};
