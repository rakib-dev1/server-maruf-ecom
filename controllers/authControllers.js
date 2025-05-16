const jwt = require("jsonwebtoken");
const { db } = require("../config/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

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
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

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
    if (existing) return res.status(400).json({ message: "Email already registered" });

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

module.exports = { authLogin, authSignup, GoogleUser };
