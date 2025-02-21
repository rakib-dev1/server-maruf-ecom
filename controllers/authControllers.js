const jwt = require("jsonwebtoken");
const { db } = require("../config/db");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const authLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ id: user.id, name: user.email, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const authSignup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };
    // Insert user into MongoDB
    await db.collection("users").insertOne(user);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { authLogin, authSignup };
